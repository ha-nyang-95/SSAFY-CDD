import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os

class S3Manager:
    def __init__(self):
        # 환경 변수에서 AWS 자격 증명 및 버킷 정보 로드
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION")
        self.bucket_name = os.getenv("AWS_BUCKET_NAME")
        
        # 필수 환경 변수 확인
        if not all([self.aws_access_key_id, self.aws_secret_access_key, self.aws_region, self.bucket_name]):
            raise ValueError("AWS 자격 증명 또는 버킷 이름이 환경 변수에 완전히 설정되지 않았습니다.")

        try:
            # S3 클라이언트 초기화
            self.client = boto3.client(
                's3',
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key,
                region_name=self.aws_region
            )
            # 버킷 존재 여부 확인
            self.client.head_bucket(Bucket=self.bucket_name)
        except (NoCredentialsError, ClientError) as e:
            raise RuntimeError(f"S3 클라이언트 초기화 또는 버킷 연결에 실패했습니다: {e}")

    def upload_fileobj(self, file_obj, s3_object_key: str, content_type: str = 'application/octet-stream'):
        """
        메모리 내 파일 객체(file-like object)를 S3 버킷에 업로드

        :param file_obj: 업로드할 파일 객체 (e.g., io.BytesIO)
        :param s3_object_key: S3에 저장될 객체의 이름
        :param content_type: 업로드될 파일의 MIME 타입
        """
        try:
            self.client.upload_fileobj(
                file_obj, 
                self.bucket_name, 
                s3_object_key,
                ExtraArgs={'ContentType': content_type}
            )
            print(f"파일 객체를 '{self.bucket_name}' 버킷에 '{s3_object_key}'로 성공적으로 업로드했습니다.")
        except ClientError as e:
            print(f"S3 업로드 중 오류가 발생했습니다: {e}")
            raise  # 오류를 다시 발생시켜 호출 측에서 처리하도록 함

    def download_fileobj(self, s3_object_key: str, file_obj):
        """
        S3 버킷의 파일을 메모리 내 파일 객체로 다운로드
        
        :param s3_object_key: S3에 저장된 객체의 키
        :param file_obj: 다운로드한 데이터를 쓸 파일 객체 (e.g., io.BytesIO)
        """
        try:
            self.client.download_fileobj(self.bucket_name, s3_object_key, file_obj)
            print(f"'{self.bucket_name}' 버킷의 '{s3_object_key}' 객체를 파일 객체로 성공적으로 다운로드했습니다.")
            file_obj.seek(0)
        except ClientError as e:
            print(f"S3 다운로드 중 오류가 발생했습니다: {e}")
            raise