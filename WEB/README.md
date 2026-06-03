# CrackTrack - 균열 탐지 드론 시스템

균열 탐지 드론을 통한 구조물 점검 자동화 시스템입니다.

## 프로젝트 개요

이 시스템은 드론을 활용하여 구조물의 균열을 자동으로 탐지하고, 실시간으로 모니터링하며, 상세한 분석 보고서를 제공합니다.

## 기술 스택

### Frontend
- **Framework**: React 19.1 + TypeScript 5.8
- **Build Tool**: Vite 7 (`@vitejs/plugin-react-swc`)
- **Styling**: Emotion (CSS-in-JS, `@emotion/react` / `@emotion/styled`)
- **State Management**: React Hooks
- **Routing**: React Router v6
- **HTTP Client**: 네이티브 `fetch` 기반 자체 클라이언트 (`src/api/client.ts`, 쿠키 기반 인증)
- **Media**: hls.js (실시간 영상 스트리밍 재생)
- **Container**: Docker

### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17
- **Database**: MySQL (Spring Data JPA / Hibernate)
- **Security**: Spring Security + JWT (`jjwt` 0.12.5)
- **Build Tool**: Gradle
- **Container**: Docker
- **Cloud**: AWS SDK v2 (S3, IVS)
- **API Documentation**: springdoc-openapi (Swagger UI)

### Serverless (AWS Lambda)
- 모델링/세그멘테이션/영상 후처리를 위한 Lambda 함수 (`WEB/AWS/`)
- S3 이벤트 트리거 기반 후처리 파이프라인

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **API Documentation**: Swagger/OpenAPI

## 주요 기능

### 사용자 인증 및 보안
- JWT 기반 사용자 인증
- Spring Security를 통한 API 보안
- CORS 설정

### 점검 관리
- 점검 작업 생성 및 관리
- 실시간 점검 모니터링
- 점검 결과 저장 및 조회
- 검색 및 필터링 기능

### 미디어 처리
- 비디오 파일 업로드 및 처리
- 이미지 분석 및 저장
- 3D 모델링 데이터 관리

### 균열 탐지
- 이미지 기반 균열 탐지
- 세그먼테이션 데이터 처리
- LiDAR 데이터 분석

### 실시간 모니터링
- 점검 진행 상황 실시간 확인
- 데이터 스트리밍 모니터링
- 진행률 표시

### 보고서 관리
- 점검 결과 조회
- 이미지 및 분석 데이터 확인
- 데이터 다운로드

## 프로젝트 구조

```
WEB/
├── FE/                    # 프론트엔드 (React 19 + TypeScript + Vite 7)
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   ├── api/           # API 통신 (client.ts: fetch 래퍼, 도메인별 모듈)
│   │   ├── theme/         # 테마 및 스타일링 (Emotion)
│   │   ├── assets/        # 정적 리소스
│   │   └── utils/         # 유틸리티 함수
│   ├── package.json       # 프로젝트 의존성
│   ├── vite.config.ts     # Vite 설정
│   └── Dockerfile         # Docker 이미지 설정
│
├── BE/                    # 백엔드 (Spring Boot 3.5.4 + Java 17)
│   └── CrackTrack/        # 메인 프로젝트
│       ├── src/main/java/com/b102/cracktrack/
│       │   ├── domain/    # 도메인별 모듈 (13개)
│       │   │   ├── auth/       # 인증 (JWT)
│       │   │   ├── crack/      # 균열
│       │   │   ├── detection/  # 균열 탐지
│       │   │   ├── district/   # 지역/구역
│       │   │   ├── image/      # 이미지 처리
│       │   │   ├── lambda/     # Lambda 연동
│       │   │   ├── lidar/      # LiDAR 데이터
│       │   │   ├── modeling/   # 3D 모델링
│       │   │   ├── security/   # 보안
│       │   │   ├── segment/    # 세그멘테이션
│       │   │   ├── task/       # 작업 관리
│       │   │   ├── user/       # 사용자
│       │   │   └── video/      # 비디오 처리
│       │   └── ...        # 공통/설정 클래스
│       ├── build.gradle   # Gradle 빌드 설정
│       └── Dockerfile     # Docker 이미지 설정
│
├── AWS/                   # AWS Lambda 후처리 스크립트 (S3 이벤트 트리거)
│   ├── 3d_lendering.py       # 3D 모델링 API 호출 트리거
│   ├── post_segmentation.py  # 세그멘테이션 추론 API 호출 트리거
│   ├── post_back.py          # 처리 결과를 백엔드로 콜백(post-back)
│   └── video_combine.py      # FFmpeg 기반 영상 결합/후처리
│
├── docker-compose.yml     # Docker 컨테이너 오케스트레이션
└── README.md              # 이 파일
```

## 실행 방법

### 1. 환경 요구사항
- **Frontend**: Node.js 20+ (Vite 7 요구사항)
- **Backend**: Java 17+, MySQL 8.0+
- **공통**: Docker & Docker Compose

### 2. 환경변수 설정

#### Backend 환경변수
```bash
# 필수 환경변수
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

# AWS 설정 (선택사항)
AWS_ENABLED=true
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your_bucket_name
```

#### Frontend 환경변수
```bash
# .env 파일 생성
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=CrackTrack
```

### 3. Docker로 전체 실행 (권장)
```bash
# 프로젝트 루트에서
docker-compose up -d
```

### 4. 개별 실행

#### Frontend만 실행
```bash
cd FE
npm install
npm run dev
```

#### Backend만 실행
```bash
cd BE
./gradlew bootRun
```

## API 문서

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs

## 주요 설정

### 데이터베이스
- MySQL 연결 설정
- JPA/Hibernate 설정
- 스키마 자동 생성 비활성화

### 보안
- JWT 토큰 유효기간: 30분 (액세스), 7일 (리프레시)
- CORS 허용 도메인: localhost:5173, 43.203.22.137, shyo2.com

### 로깅
- 프로덕션 환경: WARN 레벨 이상
- 개발 환경: INFO 레벨 이상

## 개발 가이드

### Frontend 개발
- 컴포넌트 기반 아키텍처
- TypeScript로 타입 안전성 확보
- Emotion을 통한 CSS-in-JS 스타일링
- 반응형 디자인 지원

### Backend 개발
- 도메인 주도 설계 (DDD) 적용
- 계층별 분리 (Controller, Service, Repository)
- Spring Security를 통한 보안 강화
- JPA/Hibernate를 통한 데이터 접근

## 문제 해결

### 일반적인 문제
1. **포트 충돌**: Frontend(5173), Backend(8080) 포트 확인
2. **데이터베이스 연결 실패**: MySQL 서비스 상태 및 환경변수 확인
3. **JWT 인증 실패**: JWT_SECRET 환경변수 설정 확인
4. **CORS 오류**: 백엔드 CORS 설정 확인

### 로그 확인
```bash
# Docker 로그
docker-compose logs -f

# Frontend 로그
docker-compose logs -f frontend

# Backend 로그
docker-compose logs -f backend
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/IssueFeature`)
3. Commit your Changes (`git commit -m 'Add some IssueFeature'`)
4. Push to the Branch (`git push origin feature/IssueFeature`)
5. Open a Pull Request


## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.
