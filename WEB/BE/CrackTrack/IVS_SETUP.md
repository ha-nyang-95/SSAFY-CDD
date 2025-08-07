# AWS IVS (Interactive Video Service) 설정 가이드

## 개요

CrackTrack 프로젝트에서 드론 실시간 스트리밍을 위한 AWS IVS 설정 및 사용 방법입니다.

## 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Drone App     │    │   Spring Boot   │    │   AWS IVS       │
│                 │    │   Backend       │    │                 │
│  RTMPS Stream   │───▶│  IVS Service    │───▶│  Channel        │
│                 │    │                 │    │  Stream Key     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 1. AWS IAM 권한 설정

### 필요한 권한
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ivs:CreateChannel",
                "ivs:DeleteChannel",
                "ivs:ListChannels",
                "ivs:CreateStreamKey",
                "ivs:DeleteStreamKey",
                "ivs:ListStreamKeys",
                "ivs:TagResource",
                "ivs:BatchGetChannel"
            ],
            "Resource": "*"
        }
    ]
}
```

### 환경변수 설정
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-2
export AWS_IVS_ENABLED=true
```

## 2. 데이터베이스 스키마

### IVS Channels 테이블
```sql
CREATE TABLE ivs_channels (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_arn     VARCHAR(255) NOT NULL UNIQUE,
    channel_name    VARCHAR(100) NOT NULL,
    playback_url    VARCHAR(500) NOT NULL,
    ingest_endpoint VARCHAR(255) NOT NULL,
    status          ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    drone_id        BIGINT NOT NULL,
    created_at      DATETIME NOT NULL,
    updated_at      DATETIME NOT NULL,
    CONSTRAINT fk_ivs_channel_drone FOREIGN KEY (drone_id) REFERENCES drones (drone_id) ON DELETE CASCADE
);
```

### IVS Stream Keys 테이블
```sql
CREATE TABLE ivs_stream_keys (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    stream_key_arn    VARCHAR(255) NOT NULL UNIQUE,
    stream_key_value  VARCHAR(255) NOT NULL,
    status            ENUM ('ACTIVE', 'INACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    channel_id        BIGINT NOT NULL,
    created_at        DATETIME NOT NULL,
    updated_at        DATETIME NOT NULL,
    CONSTRAINT fk_ivs_stream_key_channel FOREIGN KEY (channel_id) REFERENCES ivs_channels (id) ON DELETE CASCADE
);
```

## 3. API 엔드포인트

### 채널 관리
- `POST /api/ivs/channels` - IVS 채널 생성
- `GET /api/ivs/channels/drone/{droneId}` - 드론별 채널 조회
- `GET /api/ivs/channels` - 모든 활성 채널 조회
- `DELETE /api/ivs/channels/{channelId}` - 채널 삭제

### 스트림 키 관리
- `POST /api/ivs/channels/{channelId}/stream-keys` - 스트림 키 생성
- `GET /api/ivs/stream-keys/drone/{droneId}` - 드론별 스트림 키 조회
- `DELETE /api/ivs/stream-keys/{streamKeyId}` - 스트림 키 삭제

### 드론 IVS 설정
- `POST /api/ivs/setup/drone/{droneId}` - 드론 IVS 자동 설정
- `DELETE /api/ivs/cleanup/drone/{droneId}` - 드론 IVS 정리

## 4. 사용 예시

### 드론 등록 시 자동 IVS 설정
```java
// DroneServiceImpl.java에서 자동으로 IVS 설정
Drone drone = droneRepository.save(newDrone);
ivsService.setupIvsForDrone(drone.getDroneId());
```

### 스트리밍 URL 생성
```java
// RTMPS 스트리밍 URL 형식
String rtmpsUrl = "rtmps://" + ingestEndpoint + ":443/app/" + streamKeyValue;
```

## 5. 드론 앱에서 사용

### 스트리밍 시작
1. 드론 등록 시 자동으로 IVS 채널과 스트림 키가 생성됩니다.
2. API를 통해 스트리밍 URL을 받아옵니다.
3. RTMPS 프로토콜로 스트리밍을 시작합니다.

### 예시 코드 (Android)
```kotlin
// 스트리밍 URL 가져오기
val response = apiService.getStreamKeysByDroneId(droneId)
val streamKey = response.data.first()
val rtmpsUrl = streamKey.fullIngestUrl

// RTMPS 스트리밍 시작
rtmpClient.startStream(rtmpsUrl)
```

## 6. 모니터링 및 관리

### 로그 확인
```bash
# IVS 관련 로그
tail -f logs/application.log | grep IVS
```

### AWS 콘솔에서 확인
- AWS IVS 콘솔에서 채널 상태 확인
- 스트림 키 관리
- 실시간 스트리밍 모니터링

## 7. 비용 관리

### IVS 요금 (서울 리전)
- 채널 생성: 무료
- 스트림 수신: $0.20/GB
- 스트림 시청: $0.20/GB
- 녹화: $0.20/GB

### 예상 비용
- 1시간 스트리밍 (720p): 약 $0.50-1.00
- 월 100시간 사용: 약 $50-100

## 8. 보안 고려사항

### 스트림 키 보안
- 스트림 키는 민감한 정보이므로 안전하게 관리
- 정기적인 키 교체 권장
- HTTPS를 통한 API 통신 필수

### IAM 권한 최소화
- 필요한 최소 권한만 부여
- 정기적인 권한 검토

## 9. 트러블슈팅

### 일반적인 문제들

1. **채널 생성 실패**
   - AWS 권한 확인
   - 리전 설정 확인
   - 네트워크 연결 확인

2. **스트리밍 연결 실패**
   - 스트림 키 유효성 확인
   - RTMPS URL 형식 확인
   - 방화벽 설정 확인

3. **비용 초과**
   - 사용량 모니터링
   - 불필요한 채널 정리
   - 스트리밍 품질 조정

## 10. 개발 환경 설정

### 로컬 개발
```bash
# 환경변수 설정
export AWS_IVS_ENABLED=true
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# 애플리케이션 실행
./gradlew bootRun
```

### 테스트
```bash
# IVS API 테스트
curl -X POST http://localhost:8080/api/ivs/setup/drone/1 \
  -H "Authorization: Bearer your_token"
``` 