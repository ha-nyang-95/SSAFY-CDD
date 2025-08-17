import boto3
import os
import subprocess
from urllib.parse import unquote_plus

s3_client = boto3.client('s3')

# FFmpeg 바이너리 파일이 Lambda Layer를 통해 /opt/ffmpeg에 위치한다고 가정합니다.
# 경로가 다를 경우 이 부분을 수정해주세요.
FFMPEG_PATH = '/opt/ffmpeg' 

def merge_videos_in_folder(bucket_name, source_prefix, output_key):
    """
    지정된 S3 폴더(source_prefix)의 모든 비디오를 병합하여 
    지정된 경로(output_key)에 저장합니다.

    :param bucket_name: S3 버킷 이름
    :param source_prefix: 병합할 영상들이 있는 S3 폴더 경로 (예: 'some/path/raw_video/')
    :param output_key: 병합된 영상이 저장될 S3 파일 경로 (예: 'some/path/video.mp4')
    :return: 생성된 임시 파일 경로 리스트
    """
    print(f"--- Starting merge process for {source_prefix} ---")
    
    local_temp_files = []
    
    try:
        # 1. 소스 폴더의 모든 객체 목록 가져오기
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)
        
        if 'Contents' not in response:
            print(f"Warning: No files found in {source_prefix}. Skipping.")
            return []

        # 2. 객체들을 마지막 수정 시간(업로드 시간) 순으로 정렬
        video_objects = sorted(response['Contents'], key=lambda obj: obj['LastModified'])
        
        download_paths = []
        manifest_content = ""

        for obj in video_objects:
            key = obj['Key']
            # 폴더 자체를 제외하고, 비디오 확장자로 끝나는 파일만 처리
            if not key.endswith('/') and key.lower().endswith(('.mp4', '.ts', '.mov', '.avi')):
                # 임시 파일 이름이 겹치지 않도록 파일 이름에 폴더명을 포함
                filename = f"{source_prefix.replace('/', '_')}_{os.path.basename(key)}"
                temp_path = f"/tmp/{filename}"
                download_paths.append({'key': key, 'path': temp_path})
                manifest_content += f"file '{temp_path}'\n"
        
        if not download_paths:
            print(f"Warning: No video files found to merge in {source_prefix}. Skipping.")
            return []

        # 3. 영상 파일들을 Lambda의 /tmp 디렉토리로 다운로드
        print(f"Downloading videos from {source_prefix}...")
        for item in download_paths:
            print(f"  Downloading s3://{bucket_name}/{item['key']} to {item['path']}")
            s3_client.download_file(bucket_name, item['key'], item['path'])
            local_temp_files.append(item['path'])

        # 4. FFmpeg concat demuxer를 위한 manifest 파일 생성
        # manifest 파일 이름도 고유하게 만듭니다.
        manifest_filename = f"manifest_{os.path.basename(output_key)}.txt"
        manifest_path = f"/tmp/{manifest_filename}"
        with open(manifest_path, "w") as f:
            f.write(manifest_content)
        local_temp_files.append(manifest_path)
        print("Manifest file created at:", manifest_path)

        # 5. FFmpeg을 사용하여 영상 병합
        output_temp_path = f"/tmp/{os.path.basename(output_key)}"
        local_temp_files.append(output_temp_path)
        
        command = [
            FFMPEG_PATH,
            '-f', 'concat',
            '-safe', '0',
            '-i', manifest_path,
            '-c', 'copy',  # 재인코딩 없이 스트림 복사 (매우 빠름)
            output_temp_path
        ]
        
        print(f"Running FFmpeg command: {' '.join(command)}")
        result = subprocess.run(command, capture_output=True, text=True)
        
        if result.returncode != 0:
            print("FFmpeg Error:")
            print(result.stderr)
            raise Exception(f"FFmpeg failed for {source_prefix}")

        print(f"Videos from {source_prefix} merged successfully.")

        # 6. 결과 파일을 S3에 업로드
        print(f"Uploading merged video to s3://{bucket_name}/{output_key}")
        s3_client.upload_file(output_temp_path, bucket_name, output_key)

        print(f"--- Finished merge process for {source_prefix} ---")
        
        return local_temp_files

    except Exception as e:
        # 이 함수 내에서 발생한 에러는 호출자에게 전파합니다.
        print(f"Error during merge for {source_prefix}: {str(e)}")
        raise e


def lambda_handler(event, context):
    """
    S3에 finish.txt 파일이 업로드되면 트리거되어
    1. raw_video/ 폴더의 모든 영상을 합쳐 video.mp4로 저장
    2. detect_video/ 폴더의 모든 영상을 합쳐 detect.mp4로 저장
    """
    
    # 전체 프로세스에서 생성된 모든 임시 파일을 추적
    all_temp_files = []

    try:
        # S3 이벤트 정보 파싱
        record = event['Records'][0]
        bucket_name = record['s3']['bucket']['name']
        trigger_file_key = unquote_plus(record['s3']['object']['key'])
        
        if not trigger_file_key.endswith('finish.txt'):
            print(f"Ignoring non-trigger file: {trigger_file_key}")
            return {'statusCode': 200, 'body': 'Not a trigger file.'}

        # 기본 경로 설정
        base_prefix = os.path.dirname(trigger_file_key)
        print(f"Bucket: {bucket_name}, Base Prefix: {base_prefix}")

        # 1. 'raw_video' 폴더 처리
        raw_video_prefix = os.path.join(base_prefix, 'raw_video/') if base_prefix else 'raw_video/'
        raw_output_key = os.path.join(base_prefix, 'video.mp4') if base_prefix else 'video.mp4'
        raw_temp_files = merge_videos_in_folder(bucket_name, raw_video_prefix, raw_output_key)
        all_temp_files.extend(raw_temp_files)

        # 2. 'detect_video' 폴더 처리
        detect_video_prefix = os.path.join(base_prefix, 'detect_video/') if base_prefix else 'detect_video/'
        detect_output_key = os.path.join(base_prefix, 'detect.mp4') if base_prefix else 'detect.mp4'
        detect_temp_files = merge_videos_in_folder(bucket_name, detect_video_prefix, detect_output_key)
        all_temp_files.extend(detect_temp_files)

        print("All processes completed successfully!")
        
        return {
            'statusCode': 200,
            'body': f'Successfully merged videos to {raw_output_key} and {detect_output_key}'
        }

    except Exception as e:
        print(f"An error occurred in the lambda_handler: {str(e)}")
        # 필요한 경우, 여기에 에러 알림 로직 추가 (SNS 등)
        raise e

    finally:
        # 9. /tmp에 다운로드된 모든 임시 파일들 삭제
        if all_temp_files:
            print("Cleaning up all temporary files...")
            for file_path in all_temp_files:
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        print(f"  Removed {file_path}")
                    except OSError as e:
                        print(f"  Error removing file {file_path}: {e}")
