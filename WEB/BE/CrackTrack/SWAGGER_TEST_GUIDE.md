# CrackTrack 백엔드 Swagger 테스트 가이드

## 개요
이 문서는 CrackTrack 백엔드 API를 Swagger UI를 통해 테스트하는 방법을 설명합니다.

## 사전 요구사항

### 1. 개발 환경 설정
- Java 17 이상
- MySQL 8.0 이상
- Gradle 7.0 이상

### 2. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# 데이터베이스 설정
SPRING_DATASOURCE_USERNAME=your_mysql_username
SPRING_DATASOURCE_PASSWORD=your_mysql_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# AWS 설정 (선택사항 - S3, IVS 기능 사용 시)
AWS_ENABLED=false
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=cracktrack
AWS_IVS_ENABLED=false
AWS_IVS_RECORDING_CONFIG_ARN=your_ivs_recording_config_arn
```

## 프로젝트 실행 방법

### 1. 데이터베이스 설정
```bash
# MySQL 서버가 실행 중인지 확인
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE cracktrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 프로젝트 빌드 및 실행
```bash
# 프로젝트 루트 디렉토리에서
./gradlew clean build
./gradlew bootRun
```

또는 IDE에서 `CrackTrackApplication.java`를 실행하세요.

## Swagger UI 접속 방법

### 1. 기본 접속 URL
애플리케이션이 실행되면 다음 URL로 Swagger UI에 접속할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API 문서 (JSON)**: http://localhost:8080/v3/api-docs

### 2. Swagger UI 사용법

#### 2.1 인증이 필요한 API 테스트
1. Swagger UI 페이지에서 우측 상단의 **Authorize** 버튼 클릭
2. **AccessToken** 필드에 JWT 토큰 입력
   - 토큰 형식: `Bearer your_jwt_token_here`
3. **Authorize** 버튼 클릭하여 인증 완료

#### 2.2 JWT 토큰 획득 방법
1. **POST /api/auth/signup** - 회원가입
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "테스트 사용자"
   }
   ```

2. **POST /api/auth/login** - 로그인
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - 응답에서 `accessToken` 값을 복사

3. Swagger UI의 Authorize에서 `Bearer ` + 복사한 토큰 입력

## 주요 API 엔드포인트

### 인증 관련 API
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 사용자 관련 API
- `GET /api/users/me` - 내 정보 조회
- `PUT /api/users/me` - 내 정보 수정
- `PUT /api/users/password` - 비밀번호 변경

### 작업 관련 API
- `GET /api/tasks` - 작업 목록 조회
- `POST /api/tasks` - 작업 생성
- `GET /api/tasks/{id}` - 작업 상세 조회
- `PUT /api/tasks/{id}` - 작업 수정
- `DELETE /api/tasks/{id}` - 작업 삭제

### 균열 관련 API
- `GET /api/cracks` - 균열 목록 조회
- `POST /api/cracks` - 균열 생성
- `GET /api/cracks/{id}` - 균열 상세 조회
- `PUT /api/cracks/{id}` - 균열 수정
- `DELETE /api/cracks/{id}` - 균열 삭제

### 위치 관련 API
- `GET /api/locations` - 위치 목록 조회
- `POST /api/locations` - 위치 생성
- `GET /api/locations/{id}` - 위치 상세 조회

## 테스트 시나리오

### 1. 기본 사용자 플로우
1. 회원가입 → 로그인 → JWT 토큰 획득
2. Authorize에서 토큰 설정
3. 내 정보 조회 테스트
4. 작업 생성 테스트
5. 균열 데이터 생성 테스트

### 2. 데이터 생성 순서
1. **위치 생성** → `POST /api/locations`
2. **작업 생성** → `POST /api/tasks`
3. **균열 생성** → `POST /api/cracks`

## 주의사항

### 1. CORS 설정
현재 백엔드에서만 테스트하므로 CORS 이슈가 없습니다.

### 2. 파일 업로드 테스트
- 이미지 파일 업로드 시 `multipart/form-data` 형식 사용
- Swagger UI에서 파일 선택 버튼을 통해 파일 업로드 가능

### 3. 에러 처리
- 400: 잘못된 요청 (입력값 검증 실패)
- 401: 인증 실패 (토큰 없음 또는 만료)
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 내부 오류

## 문제 해결

### 1. 데이터베이스 연결 오류
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql
```

### 2. 포트 충돌
```bash
# 8080 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080

# 프로세스 종료
taskkill /PID [프로세스ID] /F
```

### 3. JWT 토큰 만료
토큰이 만료되면 다시 로그인하여 새로운 토큰을 발급받으세요.

## 추가 설정

### 1. 개발 환경에서 Swagger 활성화
`application.properties`에서 다음 설정 확인:
```properties
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

### 2. 로그 레벨 조정
```properties
logging.level.com.b102.cracktrack=DEBUG
logging.level.org.springframework.security=DEBUG
```

## AWS Lambda 연동 테스트

### 1. Lambda 이벤트 처리 API
- `POST /api/lambda/event` - AWS Lambda에서 전송된 이벤트 처리

### 2. Lambda 이벤트 요청 형식
```json
{
  "uuid": "u1/2025-08-07/d4e81dc1-e8e3-4952-9d50-2f15c70d83c1",
  "files": [
    "raw_video20250806154500.mp4",
    "detected_video20250806154500.mp4",
    "Modeling20250806154500.obj",
    "crackId0/image.jpeg",
    "crackId0/lidar.json",
    "crackId0/segment.jpeg",
    "crackId1/image.jpeg",
    "crackId1/lidar.json",
    "crackId1/segment.jpeg"
  ],
  "metadata": "{\"additional\": \"metadata\"}"
}
```

### 3. 파일 타입 분류 규칙
Lambda에서 전송된 파일들은 자동으로 다음과 같이 분류됩니다:

- **VIDEO**: `raw_video`로 시작하는 파일
- **DETECTION**: `detected_video`로 시작하는 파일
- **MODELING**: `modeling`으로 시작하는 파일
- **SEGMENT**: `segment.jpeg` 또는 `segment.jpg` 파일
- **IMAGE**: `image.jpeg` 또는 `image.jpg` 파일
- **LIDAR**: `lidar.json` 파일

### 4. 파일 구조 규칙
- **비디오/디텍션/모델링**: 작업 폴더 내 직접 위치
- **이미지/라이더/세그먼트**: `crackId` 폴더 내 위치
- **crackId 추출**: `crackId0/image.jpeg` → `crackId0`

### 4. Lambda 이벤트 처리 플로우
1. **작업 생성**: 사용자가 작업을 생성하면 고유한 UUID(s3Name) 생성
2. **파일 업로드**: 작업 관련 파일들이 S3에 업로드
3. **Lambda 실행**: AWS Lambda가 파일들을 처리
4. **이벤트 전송**: Lambda에서 처리 완료 후 백엔드로 이벤트 전송
5. **데이터 저장**: 백엔드에서 파일 타입별로 엔티티 생성

### 5. Swagger에서 Lambda 이벤트 테스트
1. Swagger UI에서 `POST /api/lambda/event` 엔드포인트 선택
2. 요청 본문에 테스트 데이터 입력:
```json
{
  "uuid": "u1/2025-08-07/d4e81dc1-e8e3-4952-9d50-2f15c70d83c1",
  "files": [
    "raw_video20250806154500.mp4",
    "detected_video20250806154500.mp4",
    "Modeling20250806154500.obj",
    "crackId0/image.jpeg",
    "crackId0/lidar.json",
    "crackId0/segment.jpeg"
  ],
  "metadata": "{\"test\": \"metadata\"}"
}
```
3. **Execute** 버튼 클릭하여 테스트

### 6. Lambda 연동 시 주의사항
- **UUID 매칭**: Lambda에서 전송하는 UUID는 작업 생성 시 제공된 전체 s3Name 경로와 일치해야 함 (예: `u1/2025-08-07/d4e81dc1-e8e3-4952-9d50-2f15c70d83c1`)
- **파일명 규칙**: 파일명에 타입 정보가 포함되어야 올바른 분류 가능
- **에러 처리**: Lambda 이벤트 처리 실패 시 로그 확인 필요
- **비동기 처리**: Lambda 이벤트는 비동기로 처리되므로 즉시 응답

### 7. 개발 환경에서 Lambda 테스트
```bash
# curl을 사용한 Lambda 이벤트 테스트
curl -X POST "http://localhost:8080/api/lambda/event" \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "u1/2025-08-07/d4e81dc1-e8e3-4952-9d50-2f15c70d83c1",
    "files": [
      "raw_video20250806154500.mp4",
      "Modeling20250806154500.obj",
      "crackId0/image.jpeg",
      "crackId0/lidar.json"
    ],
    "metadata": "{\"test\": \"data\"}"
  }'
```

## 참고 자료
- [Spring Boot 3.x 공식 문서](https://spring.io/projects/spring-boot)
- [SpringDoc OpenAPI 문서](https://springdoc.org/)
- [JWT 공식 문서](https://jwt.io/)
- [AWS Lambda 공식 문서](https://docs.aws.amazon.com/lambda/) 