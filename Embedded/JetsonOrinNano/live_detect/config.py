import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# --- AWS S3 설정 ---
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# --- 비디오/모델 설정 ---
SAVE_INTERVAL_SECONDS = 10
VIDEO_FPS = 20.0
FRAME_WIDTH, FRAME_HEIGHT = 960, 720
MODEL_PATH = os.path.expanduser("~/Desktop/yolo_rtsp/best_weights_v2.pt")
TEMP_VIDEO_FOLDER = "temp_videos"

# --- 네트워크 설정 ---
RTSP_URL = os.getenv("RTSP_URL")
MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))

# --- Flask 웹 서버 설정 ---
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "default-secret-key")
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))