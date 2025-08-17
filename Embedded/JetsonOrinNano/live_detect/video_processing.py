import cv2
import torch
import time
import threading
import numpy as np
import logging
from ultralytics import YOLO
from config import FRAME_WIDTH, FRAME_HEIGHT

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class VideoProcessor:
    def __init__(self, model_path, rtsp_url):
        self.model = YOLO(model_path)
        self.rtsp_url = rtsp_url
        self.device = 0 if torch.cuda.is_available() else "cpu"
        
        self.output_frame = np.zeros((FRAME_HEIGHT, FRAME_WIDTH, 3), dtype=np.uint8)
        self.captured_frame_for_precision = None
        
        self.output_frame_lock = threading.Lock()
        self.capture_lock = threading.Lock()
        
        logging.info(f"[VideoProcessor] YOLO 모델 로드 완료. 사용 디바이스: {self.device}")

    def run(self, raw_q, annotated_q, stream_event):
        cap = None
        while True:
            stream_event.wait() # 스트림 시작 신호를 기다림

            if cap is None:
                logging.info("[VideoProcessor] RTSP 스트림 연결 시도...")
                gstreamer_pipeline = (
                    f"rtspsrc location={self.rtsp_url} latency=400 ! "
                    "rtpjpegdepay ! jpegdec ! videoconvert ! "
                    "appsink max-buffers=1 drop=true"
                )
                cap = cv2.VideoCapture(gstreamer_pipeline, cv2.CAP_GSTREAMER)

            if not cap.isOpened():
                logging.error("[VideoProcessor] RTSP 스트림을 열 수 없습니다. 5초 후 재시도.")
                if cap: cap.release()
                cap = None
                stream_event.clear() # 실패 시 이벤트 클리어
                time.sleep(5)
                continue
            
            logging.info("[VideoProcessor] RTSP 스트림 연결 성공. 프레임 처리 시작.")
            
            while stream_event.is_set():
                try:
                    success, frame = cap.read()
                    if not success:
                        logging.warning("[VideoProcessor] 프레임 읽기 실패.")
                        continue
                    
                    resized_frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
                    
                    with self.capture_lock:
                        self.captured_frame_for_precision = resized_frame.copy()

                    if not raw_q.full():
                        raw_q.put_nowait(resized_frame.copy())

                    results = self.model(resized_frame, device=self.device, verbose=False)
                    annotated_frame = results[0].plot()

                    with self.output_frame_lock:
                        self.output_frame = annotated_frame.copy()
                    
                    if not annotated_q.full():
                        annotated_q.put_nowait(annotated_frame)

                except Exception as e:
                    logging.error(f"[VideoProcessor] 프레임 처리 루프 중 오류: {e}")
                    break
            
            if cap is not None:
                cap.release()
                cap = None
            
            with self.output_frame_lock:
                self.output_frame = np.zeros((FRAME_HEIGHT, FRAME_WIDTH, 3), dtype=np.uint8)
            logging.info("[VideoProcessor] 스트림 처리 중지.")