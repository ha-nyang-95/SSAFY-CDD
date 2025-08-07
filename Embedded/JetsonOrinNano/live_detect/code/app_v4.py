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
# Flask에서 세션, 리디렉션 등 추가 기능 import
from flask import Flask, Response, render_template, jsonify, request, redirect, url_for, session
import paho.mqtt.client as mqtt

# =================================================================================
# --- 사용자 설정 및 글로벌 변수 ---
# =================================================================================
SAVE_INTERVAL_SECONDS = 20
VIDEO_FPS = 20.0
FRAME_WIDTH, FRAME_HEIGHT = 640, 480
RESULT_FOLDER = "result"
MODEL_PATH = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
RTSP_URL = "rtsp://192.168.4.10:8554/unicast"
MQTT_BROKER_HOST = "localhost"

# --- Flask 앱 및 데이터 공유 변수 ---
app = Flask(__name__)
# 세션을 안전하게 암호화하기 위한 시크릿 키 (보안을 위해 복잡하게 설정하는 것이 좋음)
app.secret_key = 'cdd-project-super-secret-key-98765'

output_frame_lock = threading.Lock()
output_frame = None 
lidar_data_lock = threading.Lock()
latest_sensor_data = None 
S3_AUTH_KEY = None # 로그인 시 입력받은 S3 인증 URL을 저장할 변수

# =================================================================================
# --- MQTT 통신 관련 함수들 ---
# =================================================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT] 브로커에 성공적으로 연결되었습니다.")
        client.subscribe("cdd/data/sensor_value") 
    else:
        print(f"[MQTT][ERROR] 연결 실패. 코드: {rc}")

def on_message(client, userdata, msg):
    global latest_sensor_data, lidar_data_lock
    print(f"[MQTT] 토픽 '{msg.topic}'에서 메시지 수신")
    try:
        data = json.loads(msg.payload.decode())
        with lidar_data_lock:
            latest_sensor_data = data
        image_base64 = data.get("image")
        if image_base64:
            print("[MQTT] 이미지 데이터 수신 완료. S3 업로드 로직을 실행할 수 있습니다.")
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
# --- 영상 저장 및 처리 관련 함수들 ---
# =================================================================================
def save_worker(frame_queue, gst_out_pipe_template, writer_params):
    print(f"[SAVE_WORKER] 영상 저장 스레드 시작. {SAVE_INTERVAL_SECONDS}초 단위로 저장합니다.")
    out = None
    last_save_time = time.time()
    while True:
        try:
            frame = frame_queue.get(timeout=1)
            if frame is None:
                if out is not None: out.release()
                break
            current_time = time.time()
            if out is None or (current_time - last_save_time) > SAVE_INTERVAL_SECONDS:
                if out is not None:
                    out.release()
                    print(f"[SAVE_WORKER] 영상 클립 저장 완료.")
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                filename = os.path.join(RESULT_FOLDER, f"{timestamp}.mp4")
                gst_out_pipe = gst_out_pipe_template.format(filename=filename)
                print(f"[SAVE_WORKER] 새 영상 클립 저장 시작: {filename}")
                out = cv2.VideoWriter(gst_out_pipe, cv2.CAP_GSTREAMER, 0, *writer_params)
                if not out.isOpened():
                    out = None
                    continue
                last_save_time = current_time
            if out is not None:
                out.write(frame)
        except queue.Empty:
            if out is not None and (time.time() - last_save_time) > SAVE_INTERVAL_SECONDS:
                out.release()
                out = None
            continue
    if out is not None:
        out.release()
    print("[SAVE_WORKER] 영상 저장 스레드 종료.")

def main_process_worker():
    global output_frame, output_frame_lock
    model = YOLO(MODEL_PATH)
    device_id = 0 if torch.cuda.is_available() else "cpu"
    print(f"[YOLO_THREAD] 실행 장치: {'GPU' if device_id == 0 else 'CPU'}")
    gst_input = (f"rtspsrc location={RTSP_URL} latency=200 ! rtpjpegdepay ! jpegdec ! videoconvert ! appsink max-buffers=1 drop=true")
    cap = cv2.VideoCapture(gst_input, cv2.CAP_GSTREAMER)
    if not cap.isOpened():
        print("[YOLO_THREAD][ERROR] RTSP 스트림을 열 수 없습니다.")
        return
    print("[YOLO_THREAD] RTSP 스트림에 성공적으로 연결되었습니다.")
    gst_output_template = ('appsrc ! videoconvert ! x264enc speed-preset=ultrafast tune=zerolatency ! h264parse ! mp4mux ! filesink location={filename}')
    frame_queue = queue.Queue(maxsize=int(VIDEO_FPS * 5))
    save_thread = threading.Thread(target=save_worker, args=(frame_queue, gst_output_template, (VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT))), daemon=True)
    save_thread.start()
    while True:
        success, frame = cap.read()
        if not success:
            time.sleep(1)
            continue
        results = model(frame, device=device_id)
        annotated_frame = results[0].plot()
        with output_frame_lock:
            output_frame = annotated_frame.copy()
        resized_frame = cv2.resize(annotated_frame, (FRAME_WIDTH, FRAME_HEIGHT))
        try:
            frame_queue.put_nowait(resized_frame)
        except queue.Full:
            pass 
    frame_queue.put(None)
    cap.release()

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
# --- Flask 라우트 (API 엔드포인트) 정의 ---
# =================================================================================

@app.route('/login', methods=['GET', 'POST'])
def login():
    global S3_AUTH_KEY
    error = None
    if request.method == 'POST':
        auth_url = request.form.get('auth_url')
        if auth_url and auth_url.startswith('http'):
            print(f"[AUTH] 인증 URL 수신: {auth_url}")
            S3_AUTH_KEY = auth_url
            session['logged_in'] = True
            session['auth_key'] = auth_url
            return redirect(url_for('index'))
        else:
            error = '유효한 URL 형식을 입력해주세요 (예: http://...)'
    return render_template('login.html', error=error)

@app.route("/")
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template("LCD_v2.html")

@app.route("/video_feed")
def video_feed():
    if not session.get('logged_in'):
        return "Unauthorized", 401
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/start_precision_detect", methods=['POST'])
def start_precision_detect():
    if not session.get('logged_in'): return "Unauthorized", 401
    print("[FLASK] /start_precision_detect 요청 수신. RPi에 MQTT 명령 전송.")
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
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    
    # 백그라운드 스레드들 시작
    mqtt_thread = threading.Thread(target=run_mqtt_client, daemon=True)
    mqtt_thread.start()
    main_process_thread = threading.Thread(target=main_process_worker, daemon=True)
    main_process_thread.start()
    
    # 메인 스레드에서 Flask 웹 서버 실행
    print("[MAIN_THREAD] Flask 서버를 시작합니다. http://127.0.0.1:5000 에서 확인하세요.")
    app.run(host='0.0.0.0', port=5000, debug=False)