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
from flask import Flask, Response, render_template, jsonify
import paho.mqtt.client as mqtt

# =================================================================================
# --- 사용자 설정 ---
# =================================================================================
SAVE_INTERVAL_SECONDS = 20
VIDEO_FPS = 20.0
FRAME_WIDTH, FRAME_HEIGHT = 640, 480
RESULT_FOLDER = "result"
MODEL_PATH = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
RTSP_URL = "rtsp://192.168.4.10:8554/unicast"
MQTT_BROKER_HOST = "localhost" # 젯슨 자기 자신을 브로커로 사용
# =================================================================================

# --- Flask 앱 및 스레드 간 데이터 공유를 위한 글로벌 변수 ---
app = Flask(__name__)
output_frame_lock = threading.Lock()
output_frame = None 
lidar_data_lock = threading.Lock()
latest_sensor_data = None # RPi에서 받은 최신 센서 값을 저장

# =================================================================================
# --- MQTT 통신 관련 함수들 ---
# =================================================================================
def on_connect(client, userdata, flags, rc):
    """MQTT 브로커에 연결되었을 때 호출되는 콜백 함수"""
    if rc == 0:
        print("[MQTT] 브로커에 성공적으로 연결되었습니다.")
        # 라즈베리파이의 센서 데이터가 발행될 토픽을 구독
        client.subscribe("cdd/data/sensor_value") 
    else:
        print(f"[MQTT][ERROR] 연결 실패. 코드: {rc}")

def on_message(client, userdata, msg):
    """구독한 토픽에 메시지가 도착했을 때 호출되는 콜백 함수"""
    global latest_sensor_data, lidar_data_lock
    print(f"[MQTT] 토픽 '{msg.topic}'에서 메시지 수신")
    try:
        # 받은 JSON 메시지를 파싱하여 글로벌 변수에 저장
        data = json.loads(msg.payload.decode())
        with lidar_data_lock:
            latest_sensor_data = data
        
        # 참고: 여기서 S3 업로드 로직을 실행할 수 있습니다.
        image_base64 = data.get("image")
        if image_base64:
            print("[MQTT] 이미지 데이터 수신 완료. S3 업로드 로직을 실행할 수 있습니다.")
            # image_bytes = base64.b64decode(image_base64)
            # upload_to_s3(image_bytes) # 예시 함수
    except Exception as e:
        print(f"[MQTT][ERROR] 메시지 처리 중 오류 발생: {e}")

def run_mqtt_client():
    """MQTT 클라이언트를 실행하고 네트워크 루프를 계속 도는 함수"""
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    try:
        client.connect(MQTT_BROKER_HOST, 1883, 60) 
        client.loop_forever() # 백그라운드에서 계속 실행
    except Exception as e:
        print(f"[MQTT][ERROR] MQTT 클라이언트 실행 중 오류 발생: {e}")

# =================================================================================
# --- 영상 저장 및 처리 관련 함수들 (이전과 동일) ---
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
                    print(f"[SAVE_WORKER][ERROR] 새 영상 파일({filename}) 열기 실패")
                    out = None
                    continue
                last_save_time = current_time
            if out is not None:
                out.write(frame)
        except queue.Empty:
            if out is not None and (time.time() - last_save_time) > SAVE_INTERVAL_SECONDS:
                print(f"[SAVE_WORKER] (큐 비어있음) 영상 클립 저장 완료.")
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
            print("[YOLO_THREAD][WARNING] 스트림에서 프레임 읽기 실패. 1초 후 재시도합니다.")
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

# --- 웹 스트리밍용 프레임 생성기 (이전과 동일) ---
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
@app.route("/")
def index():
    return render_template("LCD_v2.html")

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/start_precision_detect", methods=['POST'])
def start_precision_detect():
    """웹 UI의 '정밀 탐지' 버튼 클릭 시 호출됨"""
    print("[FLASK] /start_precision_detect 요청 수신. RPi에 MQTT 명령 전송.")
    try:
        # 일회성 MQTT 클라이언트를 만들어 명령 전송
        client = mqtt.Client()
        client.connect(MQTT_BROKER_HOST, 1883, 60)
        # 라즈베리파이에게 "START" 라는 명령 메시지를 보냄
        client.publish("cdd/command/detect", "START")
        client.disconnect()
        return jsonify(status="success", message="Command sent to RPi.")
    except Exception as e:
        print(f"[FLASK][ERROR] MQTT 명령 전송 실패: {e}")
        return jsonify(status="error", message=str(e))

@app.route("/get_sensor_data")
def get_sensor_data():
    """웹 UI가 주기적으로 최신 센서 데이터를 요청할 때 호출됨"""
    global latest_sensor_data, lidar_data_lock
    data_to_send = None
    with lidar_data_lock:
        if latest_sensor_data:
            data_to_send = latest_sensor_data
            latest_sensor_data = None # 한번 보낸 데이터는 비워줌 (중복 표시 방지)
    
    if data_to_send:
        # 새 데이터가 있으면 데이터와 함께 new_data: true 전송
        return jsonify(new_data=True, data=data_to_send)
    else:
        # 새 데이터가 없으면 new_data: false 전송
        return jsonify(new_data=False)

# =================================================================================
# --- 메인 실행 블록 ---
# =================================================================================
if __name__ == '__main__':
    if not os.path.exists(RESULT_FOLDER):
        os.makedirs(RESULT_FOLDER)
    
    # 1. 백그라운드에서 MQTT 클라이언트 스레드 시작
    mqtt_thread = threading.Thread(target=run_mqtt_client, daemon=True)
    mqtt_thread.start()
    
    # 2. 백그라운드에서 YOLO 추론 및 저장 스레드 시작
    main_process_thread = threading.Thread(target=main_process_worker, daemon=True)
    main_process_thread.start()
    
    # 3. 메인 스레드에서 Flask 웹 서버 실행
    print("[MAIN_THREAD] Flask 서버를 시작합니다. http://127.0.0.1:5000 에서 확인하세요.")
    app.run(host='0.0.0.0', port=5000, debug=False)