import os
import threading
import time
import queue
import datetime
import boto3
import cv2
import logging
from config import TEMP_VIDEO_FOLDER, VIDEO_FPS, SAVE_INTERVAL_SECONDS, FRAME_WIDTH, FRAME_HEIGHT

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class S3Handler:
    def __init__(self, access_key, secret_key, region, bucket_name):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        logging.info("[S3Handler] S3 클라이언트 초기화 완료.")

    def upload_file(self, local_file_path, s3_key):
        try:
            self.s3_client.upload_file(local_file_path, self.bucket_name, s3_key)
            logging.info(f"[S3] 파일 업로드 성공: {s3_key}")
        except Exception as e:
            logging.error(f"[S3] 파일 업로드 실패: {e}")
        finally:
            # GitLab에 올리는 코드이므로, 로컬 파일 삭제 로직은 주석 처리하여 유지
            # if os.path.exists(local_file_path):
            #     os.remove(local_file_path)
            logging.debug(f"[S3] 임시 파일 '{local_file_path}' 삭제 안 함.")

    def upload_bytes(self, data_bytes, s3_key, content_type):
        try:
            self.s3_client.put_object(
                Body=data_bytes,
                Bucket=self.bucket_name,
                Key=s3_key,
                ContentType=content_type
            )
            logging.info(f"[S3] 바이트 데이터 업로드 성공: {s3_key}")
        except Exception as e:
            logging.error(f"[S3] 바이트 데이터 업로드 실패: {e}")

# S3 비디오 업로드를 위한 워커 함수 (클래스 외부에 두어 스레드 타겟으로 사용하기 용이)
def s3_video_worker(frame_queue, s3_subfolder, stream_event, get_s3_auth_key_func, s3_handler):
    while True:
        try:
            s3_auth_key = get_s3_auth_key_func()
            if not s3_auth_key:
                time.sleep(1)
                continue

            stream_event.wait() # 스트림이 활성화될 때까지 대기

            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            s3_key = f"{s3_auth_key}/{s3_subfolder}/{timestamp}.mp4"
            local_temp_path = os.path.join(TEMP_VIDEO_FOLDER, f"{s3_subfolder}_{timestamp}.mp4")

            out = cv2.VideoWriter(
                f'appsrc ! videoconvert ! video/x-raw,format=I420 ! x264enc speed-preset=ultrafast tune=zerolatency bitrate=1200 ! h264parse ! mp4mux ! filesink location={local_temp_path}',
                cv2.CAP_GSTREAMER, 0, VIDEO_FPS, (FRAME_WIDTH, FRAME_HEIGHT)
            )

            if not out.isOpened():
                logging.warning(f"[{s3_subfolder.upper()}_WORKER] VideoWriter 열기 실패. 5초 후 재시도.")
                time.sleep(5)
                continue
            
            frames_to_collect = int(VIDEO_FPS * SAVE_INTERVAL_SECONDS)
            for _ in range(frames_to_collect):
                if not stream_event.is_set(): break
                try:
                    frame = frame_queue.get(timeout=1)
                    out.write(frame)
                except queue.Empty:
                    break
            
            out.release()
            time.sleep(0.5)

            if os.path.exists(local_temp_path) and os.path.getsize(local_temp_path) > 1024:
                threading.Thread(target=s3_handler.upload_file, args=(local_temp_path, s3_key), daemon=True).start()
            elif os.path.exists(local_temp_path):
                os.remove(local_temp_path)

        except Exception as e:
            logging.critical(f"[{s3_subfolder.upper()}_WORKER] 작업자 루프 오류: {e}")
            time.sleep(5)