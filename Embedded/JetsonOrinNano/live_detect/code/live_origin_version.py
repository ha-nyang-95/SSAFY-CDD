import cv2
from ultralytics import YOLO
import os
import torch

# 학습된 크랙 탐지 best_weights_v2 모델 경로
model_path = os.path.expanduser("best_weights_v2.pt")

if not os.path.exists(model_path):
    print(f"[ERROR] YOLO 모델이 존재하지 않습니다: {model_path}")
    exit(1)

# GPU 사용 여부 확인
if torch.cuda.is_available():
    print(f"[INFO] CUDA 사용 가능 - GPU: {torch.cuda.get_device_name(0)}")
    device_id = 0  # GPU
else:
    print("[INFO] CUDA 사용 불가 - CPU로 실행됩니다.")
    device_id = "cpu"

model = YOLO(model_path)

# RTSP 수신을 위한 GStreamer 파이프라인
gst = (
    "rtspsrc location=rtsp://192.168.4.10:8554/unicast latency=30 protocols=4 do-retransmission=0 ! "
    "rtpjpegdepay ! jpegdec ! videoconvert ! video/x-raw, format=BGR ! appsink max-buffers=1 drop=true"
)

cap = cv2.VideoCapture(gst, cv2.CAP_GSTREAMER)

if not cap.isOpened():
    print("[ERROR] RTSP 스트림을 열 수 없습니다 (GStreamer)")
    exit(1)


while cap.isOpened():
    success, frame = cap.read()
    if success:
        results = model(frame, device=0)
        annotated = results[0].plot()
        cv2.imshow("Crack Detection - YOLOv8", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        print("[WARNING] 프레임 읽기 실패")
        break

cap.release()
cv2.destroyAllWindows()
