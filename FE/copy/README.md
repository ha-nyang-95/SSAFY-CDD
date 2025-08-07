# CDD-FE 프로젝트

이 프로젝트는 드론 기반 크랙 탐지 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

### 1. Axios 기반 API 클라이언트
- **자동 토큰 갱신**: 401 에러 시 자동으로 토큰을 갱신하고 원래 요청을 재시도
- **에러 처리**: 네트워크 에러, 서버 에러 등 다양한 에러 상황 처리
- **요청/응답 인터셉터**: 모든 API 요청과 응답을 중앙에서 관리
- **타입 안전성**: TypeScript를 사용한 완전한 타입 안전성 보장

### 2. 도메인별 API 구조
```
src/api/
├── client.ts          # Axios 기반 API 클라이언트
├── auth.ts           # 인증 관련 API
├── user.ts           # 사용자 관련 API
├── drone.ts          # 드론 관련 API
└── index.ts          # API 모듈 통합 내보내기
```

### 3. 커스텀 훅을 통한 상태 관리
```
src/hooks/
├── auth/
│   ├── useAuth.ts    # 인증 관련 훅
│   └── index.ts
└── domain/
    └── drone/
        ├── useDrone.ts # 드론 관련 훅
        └── index.ts
```

## 📁 프로젝트 구조

```
CDD-FE/
├── src/
│   ├── api/                    # API 통신 모듈
│   │   ├── client.ts          # Axios 클라이언트 설정
│   │   ├── auth.ts            # 인증 API
│   │   ├── user.ts            # 사용자 API
│   │   ├── drone.ts           # 드론 API
│   │   └── index.ts           # API 모듈 내보내기
│   ├── constants/
│   │   └── api.ts             # API 상수 정의
│   ├── hooks/                 # 커스텀 훅
│   │   ├── auth/              # 인증 관련 훅
│   │   └── domain/            # 도메인별 훅
│   ├── types/                 # 타입 정의
│   │   └── index.ts           # 공통 타입
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── LoginPage.tsx      # 로그인 페이지
│   │   └── DroneRegisterPage.tsx # 드론 등록 페이지
│   └── App.tsx               # 메인 앱 컴포넌트
├── package.json
└── README.md
```

## 🔧 기술 스택

- **React 18**: 최신 React 기능 사용
- **TypeScript**: 타입 안전성 보장
- **Axios**: HTTP 클라이언트 라이브러리
- **React Router**: 클라이언트 사이드 라우팅
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Vite**: 빠른 개발 서버 및 빌드 도구

## 🚀 시작하기

### 1. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 지도 API 설정
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
VITE_VWORLD_API_KEY=E87455EF-E4B6-300F-9C6E-288F70D8158E

# 개발 환경 설정
VITE_APP_ENV=development
```

**지도 API 키 발급 방법:**

**VWorld API (현재 사용 중):**
- VWorld는 국토교통부에서 제공하는 공개 지도 서비스입니다
- 제공된 API 키를 그대로 사용하거나 [VWorld 개발자 포털](https://map.vworld.kr/map/v4/api_list.php)에서 새로운 키를 발급받을 수 있습니다

**카카오맵 API (대안):**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 후 JavaScript 키 발급
3. 도메인 설정: `http://localhost:5173`, `http://127.0.0.1:5173` 추가

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저에서 확인
- 홈페이지: `http://localhost:5173/`
- 로그인 페이지: `http://localhost:5173/login`
- 드론 등록 페이지: `http://localhost:5173/drone-register`
- 전체 지도 보기: `http://localhost:5173/map`

## 📖 API 통신 구조 설명

### 1. API 클라이언트 (`src/api/client.ts`)

```typescript
// Axios 인스턴스 생성
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // JWT 토큰을 쿠키로 전송
});

// 요청 인터셉터 - 헤더 설정
instance.interceptors.request.use((config) => {
  return config;
});

// 응답 인터셉터 - 토큰 갱신 및 에러 처리
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러 시 자동 토큰 갱신
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
    }
    return Promise.reject(error);
  }
);
```

### 2. 도메인별 API 함수 (`src/api/auth.ts`)

```typescript
export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<ApiResponse<TokenResponse>> => {
    return apiRequest<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      data: data,
    });
  },
  
  // 회원가입
  signUp: async (data: SignUpRequest): Promise<ApiResponse<User>> => {
    return apiRequest<User>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      data: data,
    });
  },
};
```

### 3. 커스텀 훅 (`src/hooks/auth/useAuth.ts`)

```typescript
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (data: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authApi.login(data);
      if (response.success) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  return { ...authState, login, signUp, logout, clearAuth };
};
```

## 🎯 주요 특징

### 1. 자동 토큰 갱신
- 401 에러 발생 시 자동으로 리프레시 토큰을 사용하여 액세스 토큰 갱신
- 갱신 중인 요청들은 큐에 저장되어 토큰 갱신 완료 후 재시도
- 갱신 실패 시 자동 로그아웃 처리

### 2. 타입 안전성
- 모든 API 응답에 대한 타입 정의
- TypeScript를 통한 컴파일 타임 에러 검출
- IDE 자동완성 및 리팩토링 지원

### 3. 에러 처리
- 네트워크 에러, 서버 에러 등 다양한 에러 상황 처리
- 사용자 친화적인 에러 메시지 제공
- 개발자용 상세 로깅

### 4. 모듈화된 구조
- 도메인별로 API 함수 분리
- 재사용 가능한 커스텀 훅
- 깔끔한 import/export 구조

## 🔄 기존 Fetch 기반과의 차이점

| 특징 | Fetch 기반 | Axios 기반 |
|------|------------|------------|
| 설정 | 매번 URL과 옵션 설정 필요 | 기본 설정으로 간소화 |
| 에러 처리 | 수동으로 response.ok 확인 | 자동으로 HTTP 에러 처리 |
| 타임아웃 | 별도 구현 필요 | 기본 제공 |
| 인터셉터 | 구현 불가 | 요청/응답 인터셉터 제공 |
| 타입 안전성 | 제한적 | 완전한 타입 지원 |
| 토큰 갱신 | 복잡한 구현 | 인터셉터로 간단 구현 |

## 📝 사용 예시

### 로그인 페이지에서 API 사용
```typescript
const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      // 로그인 성공 처리
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 내용 */}
    </form>
  );
};
```

### 드론 등록 페이지에서 API 사용
```typescript
const DroneRegisterPage: React.FC = () => {
  const { registerDrone, checkDroneExist, drone, exists } = useDrone();
  
  useEffect(() => {
    checkDroneExist(); // 컴포넌트 마운트 시 드론 존재 여부 확인
  }, []);
  
  const handleRegister = async (data: DroneRegisterRequest) => {
    try {
      await registerDrone(data);
      // 드론 등록 성공 처리
    } catch (error) {
      console.error('드론 등록 실패:', error);
    }
  };
};
```