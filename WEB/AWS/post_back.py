import json
import boto3
import os
import urllib.parse
import urllib.request

# boto3 S3 클라이언트 초기화
s3_client = boto3.client('s3')

# POST 요청을 보낼 API 서버 URL
POST_URL = 'http://43.203.222.137:8080/api/lambda/evenvt'

def lambda_handler(event, context):
    """
    S3 트리거를 받아 'crack_num' 폴더의 객체 수를 계산하고,
    결과를 지정된 URL로 POST 요청을 보내는 함수
    """
    if not POST_URL:
        print("🚨 에러: POST_URL이 설정되지 않았습니다.")
        return {'statusCode': 500, 'body': json.dumps('POST_URL is not set.')}

    try:
        # 1. S3 이벤트 정보에서 버킷 이름과 객체 키(파일 경로) 추출
        record = event['Records'][0]
        bucket_name = record['s3']['bucket']['name']
        object_key = urllib.parse.unquote_plus(record['s3']['object']['key'], encoding='utf-8')
        
        print(f"S3 이벤트 수신: 버킷='{bucket_name}', 원본 객체 키='{object_key}'")

        # 2. 'uuid'와 'crack_num' 폴더 경로 구성
        # 'uuid'는 이벤트가 발생한 파일의 상위 디렉터리 경로 (예: userID/taskId)
        uuid_path = os.path.dirname(object_key)
        
        # 'crack_num' 폴더의 경로(prefix) 지정
        crack_num_prefix = os.path.join(uuid_path, 'crack_num/')
        
        print(f"UUID 경로: '{uuid_path}'")
        print(f"'crack_num' 폴더 경로 탐색: '{crack_num_prefix}'")

        # 3. 'crack_num' 폴더 내의 모든 객체 수 계산 (ccnt)
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=crack_num_prefix)
        
        crack_count = 0
        for page in pages:
            if 'Contents' in page:
                crack_count += len(page['Contents'])
        
        print(f"결과: '{crack_num_prefix}' 폴더 내 객체 수(ccnt): {crack_count}개")

        # 4. API 서버에 보낼 데이터 준비
        post_data = {
            "uuid": uuid_path,
            "ccnt": crack_count
        }
        
        print(f"API 요청 데이터: {json.dumps(post_data)}")
        
        # JSON 형식의 데이터를 바이트로 인코딩
        encoded_data = json.dumps(post_data).encode('utf-8')

        # 5. HTTP POST 요청 생성 및 전송
        req = urllib.request.Request(
            POST_URL,
            data=encoded_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode('utf-8')
            print(f"✅ API 요청 성공. 응답 코드: {response.getcode()}")
            print(f"응답 내용: {response_body}")
            
            return {
                'statusCode': 200,
                'body': json.dumps(f"Successfully processed and sent POST request. API Response: {response_body}")
            }

    except urllib.error.HTTPError as e:
        error_response = e.read().decode('utf-8')
        print(f"🚨 HTTP 에러 발생: {e.code} {e.reason}")
        print(f"에러 응답 내용: {error_response}")
        return {'statusCode': e.code, 'body': json.dumps(f"Error calling API: {error_response}")}
    except KeyError as e:
        print(f"🚨 에러: S3 이벤트 구조가 올바르지 않습니다. 누락된 키: {e}")
        return {'statusCode': 400, 'body': json.dumps(f"Invalid S3 event structure. Missing key: {e}")}
    except Exception as e:
        print(f"🚨 처리 중 예외 발생: {str(e)}")
        return {'statusCode': 500, 'body': json.dumps(f"An error occurred: {str(e)}")}
