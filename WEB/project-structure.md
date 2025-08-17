# 프로젝트 폴더 구조

## 전체 구조
```
WEB/
├── FE/                    # 프론트엔드 (React + TypeScript + Vite)
├── BE/                    # 백엔드 (Spring Boot + Java)
└── docker-compose.yml     # Docker 컨테이너 설정
```

## Frontend (FE)

```
FE/
├── 설정 파일
│   ├── package.json           # 프로젝트 의존성 및 스크립트
│   ├── package-lock.json      # 의존성 잠금 파일
│   ├── tsconfig.json          # TypeScript 설정
│   ├── tsconfig.app.json      # 앱별 TypeScript 설정
│   ├── tsconfig.node.json     # Node.js TypeScript 설정
│   ├── vite.config.ts         # Vite 빌드 도구 설정
│   ├── eslint.config.js       # ESLint 코드 품질 설정
│   └── .gitignore            # Git 무시 파일 목록
│
├── src/                    # 소스 코드
│   ├── 메인 파일
│   │   ├── main.tsx           # 애플리케이션 진입점
│   │   ├── App.tsx            # 메인 App 컴포넌트
│   │   ├── App.css            # App 스타일
│   │   ├── index.css          # 전역 스타일
│   │   └── vite-env.d.ts      # Vite 타입 정의
│   │
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── Button/         # 버튼 컴포넌트
│   │   ├── Card/           # 카드 컴포넌트
│   │   ├── CardTile/       # 카드 타일 컴포넌트
│   │   ├── Carousel/       # 캐러셀 컴포넌트
│   │   ├── Container/      # 컨테이너 컴포넌트
│   │   ├── Dashboard/      # 대시보드 관련 컴포넌트
│   │   ├── Footer/         # 푸터 컴포넌트
│   │   ├── Heading/        # 제목 컴포넌트
│   │   ├── Hero/           # 히어로 섹션 컴포넌트
│   │   ├── ImageCard/      # 이미지 카드 컴포넌트
│   │   ├── Input/          # 입력 컴포넌트
│   │   ├── Navbar/         # 네비게이션 바 컴포넌트
│   │   ├── Panel/          # 패널 컴포넌트
│   │   ├── Report/         # 리포트 관련 컴포넌트
│   │   ├── Section/        # 섹션 컴포넌트
│   │   └── Badge/          # 배지 컴포넌트
│   │
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── inspections/    # 검사 관련 페이지
│   │   ├── reports/        # 리포트 관련 페이지
│   │   ├── dashboard.tsx      # 대시보드 페이지
│   │   ├── login.tsx          # 로그인 페이지
│   │   └── signup.tsx         # 회원가입 페이지
│   │
│   ├── layout/             # 레이아웃 컴포넌트
│   ├── api/                # API 통신 관련
│   ├── utils/              # 유틸리티 함수
│   ├── theme/              # 테마 설정
│   └── assets/             # 정적 자원 (이미지, 폰트 등)
│
├── deploy/                 # 배포 관련 설정
├── Dockerfile              # Docker 이미지 빌드 설정
├── index.html              # HTML 템플릿
├── icon.png                # 프로젝트 아이콘
├── style.json              # 스타일 설정
├── project.md              # 프로젝트 문서
└── README.md               # 프로젝트 설명서
```

## Backend (BE)

```
BE/
└── CrackTrack/             # 메인 프로젝트 (Spring Boot)
    ├── 설정 파일
    │   ├── build.gradle        # Gradle 빌드 설정
    │   ├── settings.gradle     # Gradle 프로젝트 설정
    │   ├── gradlew             # Gradle Wrapper (Linux/Mac)
    │   ├── gradlew.bat         # Gradle Wrapper (Windows)
    │   ├── .gitignore          # Git 무시 파일 목록
    │   ├── .dockerignore       # Docker 무시 파일 목록
    │   ├── Dockerfile          # Docker 이미지 빌드 설정
    │   └── .gitattributes      # Git 속성 설정
    │
    ├── src/                 # 소스 코드
    │   ├── main/            # 메인 소스 코드
    │   │   ├── java/        # Java 소스 코드
    │   │   │   └── com/b102/cracktrack/
    │   │   │       ├── CrackTrackApplication.java    # 메인 애플리케이션 클래스
    │   │   │       ├── common/                       # 공통 컴포넌트
    │   │   │       └── domain/                       # 도메인 모델 및 비즈니스 로직
    │   │   │           ├── auth/                      # 인증 관련
    │   │   │           ├── crack/                     # 균열 관련
    │   │   │           ├── detection/                 # 검출 관련
    │   │   │           ├── district/                  # 지역 관련
    │   │   │           ├── image/                     # 이미지 관련
    │   │   │           ├── lambda/                    # AWS Lambda 관련
    │   │   │           ├── lidar/                     # LiDAR 관련
    │   │   │           ├── modeling/                  # 모델링 관련
    │   │   │           ├── report/                    # 리포트 관련
    │   │   │           ├── security/                  # 보안 관련
    │   │   │           ├── segment/                   # 세그먼트 관련
    │   │   │           ├── task/                      # 작업 관련
    │   │   │           ├── user/                      # 사용자 관련
    │   │   │           └── video/                     # 비디오 관련
    │   │   └── resources/  # 리소스 파일 (설정, 템플릿 등)
    │   └── test/            # 테스트 코드
    │
    ├── build/               # 빌드 결과물
    ├── .gradle/             # Gradle 캐시
    ├── .idea/               # IntelliJ IDEA 설정
    └── CDD.png              # 프로젝트 이미지
```

## Docker 설정

```
docker-compose.yml              # 프론트엔드와 백엔드 컨테이너 오케스트레이션
```

## 기술 스택 요약

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules / CSS-in-JS
- **Package Manager**: npm
- **Code Quality**: ESLint

### Backend
- **Framework**: Spring Boot (Java)
- **Build Tool**: Gradle
- **Package Manager**: Gradle Wrapper
- **Container**: Docker

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **API Documentation**: OpenAPI (YAML)
