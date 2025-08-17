import os
import queue
import threading
import time
import logging
import numpy as np
import cv2
from flask import Flask, Response, render_template, jsonify, request, redirect, url_for, session

# 설정 및 커스텀 모듈 임포트
import config
from s3_handler import S3Handler, s3_video_worker
from video_processing import VideoProcessor
from mqtt_handler import MqttController

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- 애플리케이션 상태 관리 ---
class AppState:
    def __init__(self):
        self.rtsp_stream_active = threading.Event()
        self.s3_auth_key = None
        self.main_process_thread = None

    def get_s3_auth_key(self):
        return self.s3_auth_key

# --- Flask 앱 생성 및 설정 ---
app = Flask(__name__)
app.secret_key = config.FLASK_SECRET_KEY

# --- 전역 인스턴스 초기화 ---
# 이 인스턴스들은 앱이 실행되는 동안 유지됩니다.
app_state = AppState()
s3_handler = S3Handler(config.AWS_ACCESS_KEY_ID, config.AWS_SECRET_ACCESS_KEY, config.AWS_REGION, config.AWS_BUCKET_NAME)
video_processor = VideoProcessor(config.MODEL_PATH, config.RTSP_URL)
mqtt_controller = MqttController(s3_handler)
mqtt_controller.get_s3_auth_key_func = app_state.get_s3_auth_key # 함수 주입

# 프레임 공유를 위한 큐
raw_frame_queue = queue.Queue(maxsize=int(config.VIDEO_FPS * 5))
annotated_frame_queue = queue.Queue(maxsize=int(config.VIDEO_FPS * 5))

# --- 웹 스트리밍 함수 ---
def generate_frames():
    while True:
        with video_processor.output_frame_lock:
            frame_to_show = video_processor.output_frame
        
        (flag, encodedImage) = cv2.imencode(".jpg", frame_to_show)
        if not flag:
            continue
            
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
        time.sleep(1 / config.VIDEO_FPS)

# --- Flask 라우트 ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_id = request.form.get('user_id')
        task_id = request.form.get('task_id')

        if user_id and task_id:
            s3_base_path = f"{user_id}/{task_id}"
            app_state.s3_auth_key = s3_base_path
            session['logged_in'] = True
            session['s3_base_path'] = s3_base_path
            logging.info(f"[AUTH] 로그인 성공. 사용자: {user_id}, 작업: {task_id}. S3 경로: {s3_base_path}")
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error='사용자 ID와 작업 ID를 모두 입력해주세요.')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    s3_base_path = session.get('s3_base_path')
    if s3_base_path:
        s3_key = f"{s3_base_path}/finish.txt"
        s3_handler.upload_bytes(b".", s3_key, 'text/plain')
        logging.info(f"[S3] 'finish.txt' 파일 업로드 완료: {s3_key}")

    session.clear()
    app_state.s3_auth_key = None
    if app_state.rtsp_stream_active.is_set():
        app_state.rtsp_stream_active.clear()
    logging.info("[AUTH] 로그아웃 되었습니다.")
    return redirect(url_for('login'))

@app.route("/")
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template("final.html")

@app.route("/video_feed")
def video_feed():
    if not session.get('logged_in'): return "Unauthorized", 401
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route('/start_stream', methods=['POST'])
def start_stream():
    if not session.get('logged_in'): return jsonify(status="error", message="Unauthorized"), 401
    
    if not app_state.rtsp_stream_active.is_set():
        app_state.rtsp_stream_active.set()
        logging.info("[CONTROL] 스트림 시작 명령 수신.")
    return jsonify(status="success", message="Stream started.")

@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    if not session.get('logged_in'): return jsonify(status="error", message="Unauthorized"), 401
    
    if app_state.rtsp_stream_active.is_set():
        app_state.rtsp_stream_active.clear()
        logging.info("[CONTROL] 스트림 중지 명령 수신.")
    return jsonify(status="success", message="Stream stopped.")

@app.route("/start_precision_detect", methods=['POST'])
def start_precision_detect():
    if not session.get('logged_in'): return jsonify(status="error", message="Unauthorized"), 401
    
    with video_processor.capture_lock:
        if video_processor.captured_frame_for_precision is not None:
            mqtt_controller.frame_to_upload = video_processor.captured_frame_for_precision.copy()
        else:
            return jsonify(status="error", message="캡처된 프레임이 없습니다.")
    
    if mqtt_controller.publish_command("cdd/command/detect", "START"):
        return jsonify(status="success", message="RPi에 정밀 측정 명령 전송 성공.")
    else:
        return jsonify(status="error", message="RPi에 명령 전송 실패.")

@app.route("/get_sensor_data")
def get_sensor_data():
    if not session.get('logged_in'): return "Unauthorized", 401
    
    with mqtt_controller.lidar_data_lock:
        data_to_send = mqtt_controller.latest_sensor_data
        mqtt_controller.latest_sensor_data = None
    return jsonify(new_data=bool(data_to_send), data=data_to_send)

# --- 메인 실행 블록 ---
if __name__ == '__main__':
    if not os.path.exists(config.TEMP_VIDEO_FOLDER):
        os.makedirs(config.TEMP_VIDEO_FOLDER)

    # --- 백그라운드 스레드 시작 ---
    # 1. 비디오 처리 스레드
    threading.Thread(target=video_processor.run, args=(raw_frame_queue, annotated_frame_queue, app_state.rtsp_stream_active), daemon=True).start()
    
    # 2. MQTT 클라이언트 스레드
    threading.Thread(target=mqtt_controller.run, daemon=True).start()

    # 3. S3 비디오 업로드 스레드 (원본, 추론 결과)
    threading.Thread(target=s3_video_worker, args=(raw_frame_queue, 'raw_video', app_state.rtsp_stream_active, app_state.get_s3_auth_key, s3_handler), daemon=True).start()
    threading.Thread(target=s3_video_worker, args=(annotated_frame_queue, 'detect_video', app_state.rtsp_stream_active, app_state.get_s3_auth_key, s3_handler), daemon=True).start()

    logging.info(f"[MAIN] Flask 서버를 시작합니다. http://0.0.0.0:{config.FLASK_PORT}/login 에서 확인하세요.")
    app.run(host='0.0.0.0', port=config.FLASK_PORT, debug=False)