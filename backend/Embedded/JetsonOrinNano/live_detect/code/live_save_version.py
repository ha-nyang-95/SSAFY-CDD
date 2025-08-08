import cv2
from ultralytics import YOLO
import os
import torch
import threading
import queue
import time
import datetime

# =================================================================================
# 설정
SAVE_INTERVAL_SECONDS = 20  # <--- 20초로 수정
VIDEO_FPS = 20.0
FRAME_WIDTH, FRAME_HEIGHT = 640, 480
RESULT_FOLDER = "result"
MODEL_PATH = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
RTSP_URL = "rtsp address"
# =================================================================================

def save_worker(frame_queue, gst_out_pipe_template, writer_params):
    print(f"[SAVE_WORKER] 영상 저장 스레드 시작. {SAVE_INTERVAL_SECONDS}초 단위로 저장합니다.")
    out = None
    last_save_time = time.time()
    
    while True:
        try:
            frame = frame_queue.get(timeout=1)
            if frame is None:
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
        print(f"[SAVE_WORKER] 마지막 영상 클립 저장 완료.")
    print("[SAVE_WORKER] 영상 저장 스레드 종료.")

# --- 메인  ---
if not os.path.exists(RESULT_FOLDER):
    os.makedirs(RESULT_FOLDER)
    print(f"'{RESULT_FOLDER}' 폴더를 생성했습니다.")

if not os.path.exists(MODEL_PATH):
    print(f"[ERROR] YOLO 모델이 존재하지 않습니다: {MODEL_PATH}")
    exit(1)
model = YOLO(MODEL_PATH)
device_id = 0 if torch.cuda.is_available() else "cpu"
print(f"[INFO] 실행 장치: {'GPU' if device_id == 0 else 'CPU'}")

gst_input = (f"rtspsrc location={RTSP_URL} latency=200 ! rtpjpegdepay ! jpegdec ! videoconvert ! appsink max-buffers=1 drop=true")
cap = cv2.VideoCapture(gst_input, cv2.CAP_GSTREAMER)
if not cap.isOpened():
    print("[ERROR] RTSP 스트림을 열 수 없습니다.")
    exit(1)

print("[INFO] RTSP 스트림에 성공적으로 연결되었습니다. 첫 프레임을 기다립니다...")
success, frame = cap.read()
if not success:
    print("[ERROR] RTSP 스트림에서 첫 프레임을 읽어오지 못했습니다. 프로그램을 종료합니다.")
    exit(1)

print("[INFO] 첫 프레임 수신 성공! 메인 루프를 시작합니다.")

gst_output_template = (
    'appsrc ! videoconvert ! '
    'x264enc speed-preset=ultrafast tune=zerolatency ! '
    'h264parse ! mp4mux ! '
    'filesink location={filename}'
)

frame_queue = queue.Queue(maxsize=int(VIDEO_FPS * 5)) # 약 5초 분량의 버퍼
save_thread = threading.Thread(
    target=save_worker, 
    args=(frame_queue, gst_output_template, (VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT))),
    daemon=True
)
save_thread.start()

WINDOW_NAME = "Crack Detection - YOLOv8 (Live View) | Press 'q' to quit"

try:
    while True:
        results = model(frame, device=device_id)
        annotated_frame = results[0].plot()

        resized_frame = cv2.resize(annotated_frame, (FRAME_WIDTH, FRAME_HEIGHT))
        try:
            frame_queue.put_nowait(resized_frame)
        except queue.Full:
            # 큐가 꽉 차면 메인 루프가 멈추지 않도록 오래된 프레임을 버림
            # 이 경우는 저장 스레드가 심하게 느릴 때 발생
            pass 

        cv2.imshow(WINDOW_NAME, annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        success, frame = cap.read()
        if not success:
            print("[WARNING] 스트림에서 프레임 읽기 실패. 루프를 종료합니다.")
            break

except Exception as e:
    print(f"[ERROR] 메인 루프에서 에러 발생: {e}")
finally:
    print("[INFO] 종료 처리를 시작합니다...")
    frame_queue.put(None)
    save_thread.join(timeout=5)
    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] 프로그램이 종료되었습니다.")
