import json
import urllib.request
import urllib.parse

POST_URL = 'https://image-segmentation-api-762359930014.asia-southeast1.run.app/inference'

def lambda_handler(event, context):
    if not POST_URL:
        print("오류: POST_URL 환경 변수가 설정되지 않았습니다.")
        return {
            'statusCode': 500,
            'body': json.dumps('POST_URL is not set.')
        }

    try:
        # 1. S3 이벤트에서 객체 키(파일 경로) 추출
        s3_record = event['Records'][0]['s3']
        # URL 인코딩된 객체 키를 디코딩 (예: 'test/image%201.jpeg' -> 'test/image 1.jpeg')
        object_key = urllib.parse.unquote_plus(s3_record['object']['key'], encoding='utf-8')
        
        print(f"S3 객체 키: {object_key}")
        key = object_key.split('/')[:-1]
        key = '/'.join(key) + '/'
        print('key', key)

        # 2. API 서버에 보낼 데이터 준비
        # API 요청에 따라 버킷명을 제외한 객체 키만 전달
        post_data = {
            'file_name': key
        }
        
        print(f"API 요청 데이터: {json.dumps(post_data)}")
        
        # JSON 형식의 데이터를 바이트로 인코딩
        encoded_data = json.dumps(post_data).encode('utf-8')

        # 3. HTTP POST 요청 생성 및 전송
        req = urllib.request.Request(
            POST_URL,
            data=encoded_data,
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            response_body = response.read().decode('utf-8')
            print(f"요청 성공. 응답 코드: {response.getcode()}")
            print(f"응답 내용: {response_body}")
            
            # API 성공 응답을 그대로 클라이언트에게 반환하거나, 성공 메시지를 반환
            return {
                'statusCode': response.getcode(),
                'body': response_body
            }

    except urllib.error.HTTPError as e:
        # HTTP 에러의 경우, 응답 본문을 포함하여 로그 기록
        error_response = e.read().decode('utf-8')
        print(f"HTTP 에러 발생: {e.code} {e.reason}")
        print(f"에러 응답 내용: {error_response}")
        return {
            'statusCode': e.code,
            'body': json.dumps(f"Error calling API: {error_response}")
        }
    except Exception as e:
        print(f"처리 중 예외 발생: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error processing event: {str(e)}")
        }