# CDD: Crack Detection Drone - Frontend

## Dev Modes

두 가지 실행 모드를 지원합니다.

- Demo Mode(목 데이터): 백엔드 연결 없이 데모 데이터를 사용
- Live Mode(프록시 연결): 로컬에서 `/api`를 실제 서버로 프록시해 CORS 없이 연동

### 실행

```bash
npm ci

# 데모(목 데이터)
npm run dev:demo

# 실서버와 연결 (프록시)
# macOS/zsh 예시
VITE_API_PROXY_TARGET=https://your-dev-api.example.com npm run dev:server
```

상단 우측에 `DEMO MODE` 또는 `LIVE MODE` 배지가 표시됩니다. 대시보드 제목에는 `(Demo Preview)` 표시가 추가됩니다.