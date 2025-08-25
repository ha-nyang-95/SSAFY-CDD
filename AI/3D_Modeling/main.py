import glob
import os
import subprocess
import boto3
from flask import Flask, request, jsonify
import logging
import tempfile
import shutil
from google.cloud import pubsub_v1

# --- 설정 ---
logging.basicConfig(level=logging.INFO)

# Flask 앱 및 Pub/Sub 클라이언트 초기화
app = Flask(__name__)
publisher = pubsub_v1.PublisherClient()

# GCP 및 S3 설정
PROJECT_ID = os.environ.get('GCP_PROJECT', 'cdd-3dgs') # GCP_PROJECT 환경변수가 있으면 사용
TOPIC_ID = "modeling-jobs"
S3_BUCKET_NAME = os.environ.get('AWS_BUCKET_NAME', 'cdd-public-bucket')

# Pub/Sub 토픽 경로 구성
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# 3DGS 프로젝트 경로 설정
GAUSSIAN_SPLATting_PATH = '/app/3D_gaussian_splatting/gaussian-splatting'
BASE_WORK_DIR = '/app/3D_gaussian_splatting'

# --- 실제 작업 수행 로직 (Cloud Run Job이 실행할 함수) ---
def run_job(file_prefix):
    """S3에서 비디오를 다운로드하여 3D 모델링을 수행하고 결과를 업로드합니다."""
    s3_client = boto3.client('s3')
    bucket_name = S3_BUCKET_NAME
    video_s3_key = f"{file_prefix}video.mp4"

    work_dir = tempfile.mkdtemp(dir=BASE_WORK_DIR)
    logging.info(f"Created temporary working directory: {work_dir}")

    try:
        # 1. S3에서 비디오 다운로드
        video_local_path = os.path.join(work_dir, 'video.mp4')
        logging.info(f"Downloading s3://{bucket_name}/{video_s3_key} to {video_local_path}")
        s3_client.download_file(bucket_name, video_s3_key, video_local_path)

        # 2. 비디오 프레임 추출 (ffmpeg)
        image_dir = os.path.join(work_dir, 'input')
        os.makedirs(image_dir)
        logging.info(f"Extracting frames from {video_local_path} to {image_dir}")
        subprocess.run(
            ['ffmpeg', '-i', video_local_path, '-qscale:v', '1', '-qmin', '1', '-vf', 'fps=2', f'{image_dir}/frame_%04d.png'],
            check=True, capture_output=True, text=True
        )

        # 3. COLMAP 실행
        logging.info(f"Running COLMAP for images in {image_dir}")
        subprocess.run(
            ['python3', os.path.join(GAUSSIAN_SPLATting_PATH, 'convert.py'), '--source_path', work_dir, '--image_dir', 'input'],
            check=True, capture_output=True, text=True
        )

        # 4. 3DGS 학습
        logging.info(f"Running 3DGS training for model in {work_dir}")
        subprocess.run(
            ['python3', os.path.join(GAUSSIAN_SPLATting_PATH, 'train.py'), '--source_path', work_dir, '--model_path', work_dir, '--disable_viewer'],
            check=True, capture_output=True, text=True
        )
        
        # 5. 생성된 .ply 파일 찾기
        point_cloud_dir = os.path.join(work_dir, "point_cloud")
        list_of_iterations = glob.glob(os.path.join(point_cloud_dir, "iteration_*"))
        if not list_of_iterations:
            raise FileNotFoundError(f"No iteration directories found in {point_cloud_dir}")
        latest_iteration_dir = max(list_of_iterations, key=os.path.getctime)
        latest_ply_file = os.path.join(latest_iteration_dir, "point_cloud.ply")
        if not os.path.exists(latest_ply_file):
            raise FileNotFoundError(f"No .ply file found at {latest_ply_file}")

        # 6. .ply를 .splat으로 변환
        SPLAT_CONVERT_PATH = '/app/3D_gaussian_splatting/splat/convert.py'
        splat_file_path = os.path.join(work_dir, "output.splat")
        logging.info(f"Converting {latest_ply_file} to .splat file at {splat_file_path}")
        subprocess.run(
            ['python3', SPLAT_CONVERT_PATH, latest_ply_file, '--output', splat_file_path],
            check=True, capture_output=True, text=True
        )

        # 7. 변환된 .splat 파일을 S3에 업로드
        splat_s3_key = f"{file_prefix}model.splat"
        logging.info(f"Uploading {splat_file_path} to s3://{bucket_name}/{splat_s3_key}")
        s3_client.upload_file(splat_file_path, bucket_name, splat_s3_key)

        logging.info(f"Job for {file_prefix} completed successfully.")

    except subprocess.CalledProcessError as e:
        logging.error(f"A command failed: {e.cmd}\nStdout: {e.stdout}\nStderr: {e.stderr}")
        raise
    except Exception as e:
        logging.error(f"An error occurred during job for {file_prefix}: {e}")
        raise
    finally:
        logging.info(f"Cleaning up temporary directory: {work_dir}")
        shutil.rmtree(work_dir)

# --- API 엔드포인트 (Cloud Run 서비스가 실행할 부분) ---
@app.route('/process', methods=['POST'])
def process_request():
    """HTTP 요청을 받아 Pub/Sub에 메시지를 게시합니다."""
    data = request.get_json()
    logging.info(f"Received request: {data}")

    if not data or 'file_name' not in data:
        return jsonify({"error": "file_name is required"}), 400

    file_prefix = data['file_name']

    try:
        # Pub/Sub에 메시지 게시
        future = publisher.publish(topic_path, data=file_prefix.encode("utf-8"))
        message_id = future.get()
        logging.info(f"Published message {message_id} to {topic_path} for file_prefix: {file_prefix}")
        
        # 사용자에게 즉시 응답
        return jsonify({"status": "Job accepted", "message_id": message_id, "file_name": file_prefix}), 202

    except Exception as e:
        logging.error(f"Error publishing to Pub/Sub: {e}")
        return jsonify({"error": "Failed to queue job"}), 500

# --- 메인 실행 블록 ---
if __name__ == '__main__':
    # Cloud Run Job 환경에서는 JOB_FILE_NAME 환경변수가 주입됨
    job_file_name = os.environ.get('JOB_FILE_NAME')
    if job_file_name:
        logging.info(f"Running in JOB mode for file: {job_file_name}")
        run_job(job_file_name)
    else:
        # 일반 API 서비스로 실행
        logging.info("Running in API mode")
        app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))
