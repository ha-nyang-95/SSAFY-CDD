import cv2
from ultralytics import YOLO
import os
import torch
import subprocess
import threading
import queue
import time

# --- 설정 ---
model_path = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
rtsp_url = "rtsp://192.168.4.10:8554/unicast"

rtmp_url = "rtmps://ac3c27bc23aa.global-contribute.live-video.net:443/app/sk_ap-northeast-2_SN2T4hNAoqJm_rbo2t4v54tQfZgFoPzeHk0MbrUwiVg"
#rtmp_url = "rtmps://ac3c27bc23aa.global-contribute.live-video.net:443/app/sk_ap-northeast-2_EDFjJfjmyoCf_uKiFNsUu1JJ9WKHH6KjDuSdkvbSn6T"
frame_width, frame_height = 640, 360
# CPU 부하를 고려하여 현실적인 FPS와 비트레이트 설정
out_fps = 15.0 
bitrate_kbps = 1500

# --- 스트리밍 작업을 처리할 워커 함수 ---
def stream_worker(frame_queue, gst_out_pipe, writer_params):
    print("[STREAM_WORKER] 스트리밍 스레드 시작")
    out = cv2.VideoWriter(gst_out_pipe, cv2.CAP_GSTREAMER, 0, *writer_params)
    if not out.isOpened():
        print("[STREAM_WORKER][ERROR] RTMP 송출 파이프라인 열기 실패")
        return

    while True:
        frame = frame_queue.get()
        if frame is None:
            break
        out.write(frame)
        
    print("[STREAM_WORKER] 스트리밍 스레드 종료")
    out.release()

# --- 메인 코드 시작 ---

if not os.path.exists(model_path):
    print(f"[ERROR] YOLO 모델이 존재하지 않습니다: {model_path}")
    exit(1)
model = YOLO(model_path)

device_id = 0 if torch.cuda.is_available() else "cpu"
print(f"[INFO] 실행 장치: {'GPU' if device_id == 0 else 'CPU'}")

gst_input = (
    f"rtspsrc location={rtsp_url} latency=30 ! "
    "rtpjpegdepay ! jpegdec ! videoconvert ! "
    "appsink max-buffers=1 drop=true"
)
cap = cv2.VideoCapture(gst_input, cv2.CAP_GSTREAMER)
if not cap.isOpened():
    print("[ERROR] RTSP 스트림을 열 수 없습니다.")
    exit(1)

# RTMP 송출 파이프라인 (CPU 인코딩)
gst_output = (
    f'appsrc ! videoconvert ! '
    f'x264enc tune=zerolatency speed-preset=ultrafast bitrate={bitrate_kbps} ! '
    f'video/x-h264, profile=baseline ! '
    f'flvmux streamable=true ! rtmpsink location="{rtmp_url}"'
)

# 스레드 간 통신을 위한 큐 생성
# maxsize를 제거하여 모든 프레임을 버퍼링. 서버 송출이 지연될 수 있음.
frame_queue = queue.Queue()

stream_thread = threading.Thread(
    target=stream_worker, 
    args=(frame_queue, gst_output, (out_fps, (frame_width, frame_height))),
    daemon=True
)
stream_thread.start()

print("[INFO] 메인 루프 시작. 로컬 화면은 실시간, 서버 송출은 지연될 수 있습니다.")

try:
    while True:
        success, frame = cap.read()
        if not success:
            print("[WARNING] 프레임 읽기 실패. 1초 후 재시도합니다.")
            time.sleep(1)
            continue

        results = model(frame, device=device_id)
        annotated_frame = results[0].plot()

        # IVS 송출을 위해 리사이즈된 프레임을 큐에 넣기 (이제 버려지지 않음)
        resized_frame = cv2.resize(annotated_frame, (frame_width, frame_height))
        frame_queue.put(resized_frame)

        # 메인 작업: LCD 화면에 결과 출력 (부드럽게 유지됨)
        cv2.imshow("Crack Detection - YOLOv8 (Main Display)", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

except KeyboardInterrupt:
    print("\n[INFO] Ctrl+C가 입력되어 프로그램을 종료합니다.")
finally:
    print("[INFO] 종료 처리를 시작합니다...")
    frame_queue.put(None) 
    stream_thread.join(timeout=5) # 워커 스레드가 끝나기를 최대 5초 기다림
    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] 프로그램이 종료되었습니다.")
