import cv2
from ultralytics import YOLO
import os
import torch
import threading
import queue
import time
import datetime
import json
import base64
from flask import Flask, Response, render_template, jsonify, request, redirect, url_for, session
import paho.mqtt.client as mqtt
import boto3
from dotenv import load_dotenv
from urllib.parse import urlparse

# =================================================================================
# --- 설정 및 초기화 ---
# =================================================================================
load_dotenv()
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

SAVE_INTERVAL_SECONDS = 30
VIDEO_FPS = 20.0
FRAME_WIDTH, FRAME_HEIGHT = 640, 480
MODEL_PATH = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
RTSP_URL = "rtsp://192.168.4.10:8554/unicast"
MQTT_BROKER_HOST = "localhost"
TEMP_VIDEO_FOLDER = "temp_videos"

app = Flask(__name__)
app.secret_key = 'cdd-project-super-secret-key-final'

# --- 글로벌 변수 ---
output_frame_lock = threading.Lock()
output_frame = None
lidar_data_lock = threading.Lock()
latest_sensor_data = None
S3_AUTH_KEY = None

s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY, region_name=AWS_REGION)

# =================================================================================
# --- S3 및 MQTT 관련 함수 ---
# =================================================================================
def upload_to_s3(local_file_path, s3_key):
    """로컬 파일을 S3에 업로드하고 삭제하는 함수"""
    try:
        print(f"[S3] 업로드 시작: {local_file_path} -> s3://{AWS_BUCKET_NAME}/{s3_key}")
        s3_client.upload_file(local_file_path, AWS_BUCKET_NAME, s3_key)
        print(f"[S3] 업로드 성공.")
    except Exception as e:
        print(f"[S3][ERROR] 업로드 실패: {e}")
    finally:
        if os.path.exists(local_file_path):
            os.remove(local_file_path)

def s3_video_worker(frame_queue, s3_subfolder):
    """큐의 프레임을 30초 클립으로 만들어 S3에 업로드하는 워커"""
    while True:
        if not S3_AUTH_KEY:
            time.sleep(1)
            continue
        try:
            parsed_path = urlparse(S3_AUTH_KEY).path.strip('/')
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            s3_key = f"{parsed_path}/{s3_subfolder}/{timestamp}.mp4"
            local_temp_path = os.path.join(TEMP_VIDEO_FOLDER, f"{s3_subfolder}_{timestamp}.mp4")
        except Exception as e:
            time.sleep(5)
            continue
            
        # out = cv2.VideoWriter(f'appsrc ! videoconvert ! x264enc speed-preset=ultrafast tune=zerolatency ! mp4mux ! filesink location={local_temp_path}', cv2.CAP_GSTREAMER, 0, VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT))
        # ---코드 변겅 => s3에서 저장해서 로컬에서 열어보니까 영상 인코딩이 안댐 ---
        # out = cv2.VideoWriter(
        #     f'appsrc ! videoconvert ! video/x-raw,format=I420 ! x264enc tune=zerolatency ! h264parse ! mp4mux ! filesink location={local_temp_path}',
        #     cv2.CAP_GSTREAMER, 0, VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT)
        # )
        # --- (젯슨 사투리 인코딩 기법 해제 - CPU 부담 감소) ---
        out = cv2.VideoWriter(
            f'appsrc ! videoconvert ! video/x-raw,format=I420 ! x264enc speed-preset=ultrafast tune=zerolatency bitrate=500 ! h264parse ! mp4mux ! filesink location={local_temp_path}',
            cv2.CAP_GSTREAMER, 0, VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT)
        )

        if not out.isOpened():
            time.sleep(5)
            continue
            
        start_time = time.time()
        while time.time() - start_time < SAVE_INTERVAL_SECONDS:
            try:
                frame = frame_queue.get(timeout=1)
                if frame is None: # 종료 신호
                    out.release()
                    return
                out.write(frame)
            except queue.Empty:
                continue
        
        out.release()
        time.sleep(0.5) # 파일이 완전히 닫히도록 대기 (손상 방지)
        
        upload_thread = threading.Thread(target=upload_to_s3, args=(local_temp_path, s3_key), daemon=True)
        upload_thread.start()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT] 브로커에 성공적으로 연결되었습니다.")
        client.subscribe("cdd/data/sensor_value") 
    else:
        print(f"[MQTT][ERROR] 연결 실패. 코드: {rc}")

def on_message(client, userdata, msg):
    global latest_sensor_data, lidar_data_lock
    try:
        data = json.loads(msg.payload.decode())
        with lidar_data_lock:
            latest_sensor_data = data
    except Exception as e:
        print(f"[MQTT][ERROR] 메시지 처리 중 오류 발생: {e}")

def run_mqtt_client():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    try:
        client.connect(MQTT_BROKER_HOST, 1883, 60) 
        client.loop_forever()
    except Exception as e:
        print(f"[MQTT][ERROR] MQTT 클라이언트 실행 중 오류 발생: {e}")

# =================================================================================
# --- 실시간 영상 처리/송출 (핵심 로직 안정화) ---
# =================================================================================
def main_process_worker(raw_frame_queue, annotated_frame_queue):
    global output_frame, output_frame_lock
    print("[YOLO_THREAD] YOLO 모델 로딩 시도...")
    model = YOLO(MODEL_PATH)
    device_id = 0 if torch.cuda.is_available() else "cpu"
    print(f"[YOLO_THREAD] 실행 장치: {'GPU' if device_id == 0 else 'CPU'}")
    
    cap = cv2.VideoCapture(f"rtspsrc location={RTSP_URL} latency=200 ! rtpjpegdepay ! jpegdec ! videoconvert ! appsink max-buffers=1 drop=true", cv2.CAP_GSTREAMER)
    if not cap.isOpened():
        print("[YOLO_THREAD][ERROR] RTSP 스트림을 열 수 없습니다.")
        return
    print("[YOLO_THREAD] RTSP 스트림에 성공적으로 연결되었습니다.")

    while True:
        try: # <<< 안정성을 위한 try-except 블록!
            success, frame = cap.read()
            if not success:
                print("[YOLO_THREAD][WARNING] 프레임 읽기 실패. 1초 후 재시도.")
                time.sleep(1)
                continue
            
            resized_frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
            
            # 1. 원본 프레임을 S3 업로드 큐에 넣음
            raw_frame_queue.put_nowait(resized_frame.copy())

            # 2. YOLO 추론
            results = model(resized_frame, device=device_id, verbose=False)
            annotated_frame = results[0].plot()

            # 3. 처리된 프레임을 실시간 스트리밍 & S3 업로드 큐에 동시 전달
            with output_frame_lock:
                output_frame = annotated_frame.copy()
            annotated_frame_queue.put_nowait(annotated_frame)

        except queue.Full:
            pass # 큐가 꽉 차는 것은 정상적인 상황일 수 있으므로 PASS
        except Exception as e:
            # 예측 불가능한 에러가 발생해도 스레드가 죽지 않도록 방지
            print(f"[YOLO_THREAD][CRITICAL_ERROR] 메인 루프에서 심각한 오류 발생: {e}")
            time.sleep(5) # 5초 후 재시도

def generate_frames():
    global output_frame, output_frame_lock
    while True:
        with output_frame_lock:
            if output_frame is None:
                time.sleep(0.1)
                continue
            (flag, encodedImage) = cv2.imencode(".jpg", output_frame)
            if not flag:
                continue
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

# =================================================================================
# --- Flask 라우트 (로그아웃 기능 추가) ---
# =================================================================================
@app.route('/login', methods=['GET', 'POST'])
def login():
    global S3_AUTH_KEY
    if request.method == 'POST':
        auth_url = request.form.get('auth_url')
        if auth_url and auth_url.startswith('http'):
            S3_AUTH_KEY = auth_url
            session['logged_in'] = True
            session['auth_key'] = auth_url
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='유효한 URL 형식을 입력해주세요.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    global S3_AUTH_KEY
    S3_AUTH_KEY = None
    print("[AUTH] 로그아웃 되었습니다.")
    return redirect(url_for('login'))

@app.route("/")
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template("LCD_v3.html")

@app.route("/video_feed")
def video_feed():
    if not session.get('logged_in'):
        return "Unauthorized", 401
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/start_precision_detect", methods=['POST'])
def start_precision_detect():
    if not session.get('logged_in'): return "Unauthorized", 401
    try:
        client = mqtt.Client()
        client.connect(MQTT_BROKER_HOST, 1883, 60)
        client.publish("cdd/command/detect", "START")
        client.disconnect()
        return jsonify(status="success", message="Command sent to RPi.")
    except Exception as e:
        return jsonify(status="error", message=str(e))

@app.route("/get_sensor_data")
def get_sensor_data():
    if not session.get('logged_in'): return "Unauthorized", 401
    global latest_sensor_data, lidar_data_lock
    data_to_send = None
    with lidar_data_lock:
        if latest_sensor_data:
            data_to_send = latest_sensor_data
            latest_sensor_data = None
    if data_to_send:
        return jsonify(new_data=True, data=data_to_send)
    else:
        return jsonify(new_data=False)

# =================================================================================
# --- 메인 실행 블록 ---
# =================================================================================
if __name__ == '__main__':
    if not os.path.exists(TEMP_VIDEO_FOLDER):
        os.makedirs(TEMP_VIDEO_FOLDER)
    
    raw_frame_queue = queue.Queue(maxsize=int(VIDEO_FPS * 5))
    annotated_frame_queue = queue.Queue(maxsize=int(VIDEO_FPS * 5))

    # --- 백그라운드 스레드들 시작 ---
    mqtt_thread = threading.Thread(target=run_mqtt_client, daemon=True)
    main_process_thread = threading.Thread(target=main_process_worker, args=(raw_frame_queue, annotated_frame_queue), daemon=True)
    raw_video_s3_thread = threading.Thread(target=s3_video_worker, args=(raw_frame_queue, 'raw_video'), daemon=True)
    detect_video_s3_thread = threading.Thread(target=s3_video_worker, args=(annotated_frame_queue, 'detect_video'), daemon=True)

    mqtt_thread.start()
    main_process_thread.start()
    raw_video_s3_thread.start()
    detect_video_s3_thread.start()
    
    # 메인 스레드에서 Flask 웹 서버 실행
    print("[MAIN_THREAD] Flask 서버를 시작합니다. http://127.0.0.1:5000 에서 확인하세요.")
    app.run(host='0.0.0.0', port=5000, debug=False)