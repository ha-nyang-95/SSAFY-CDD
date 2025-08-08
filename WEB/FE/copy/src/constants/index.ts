/**
 * 애플리케이션 상수 정의
 */

// 백엔드 서버 설정
export const API_BASE_URL = 'http://localhost:8080';

// API 엔드포인트 - 백엔드에 맞게 수정
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signUp',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout', 
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    ME: '/api/user/me',
    MYPAGE: '/api/user/mypage',
    ROLE: '/api/user/role',
  },
  DRONE: {
    EXIST: '/api/drone/exist',
    REGISTER: '/api/drone/register',
    ME: '/api/drone/me',
  },
  LOCATION: {
    REGISTER: '/api/location/register',
    REMOVE: '/api/location/remove',
    LIST: '/api/location/list',
  },
  // 예시 
  // 향후 추가될 분석/렌더링 API는 백엔드 구현에 따라 추가
  ANALYSIS: {
    DETECT: '/api/crack-detection',
    RESULTS: '/api/analysis',
    BATCH: '/api/analysis/batch',
  },
  RENDERING: {
    CREATE: '/api/3d-render',
    STATUS: '/api/3d-render/status',
    DOWNLOAD: '/api/3d-render/download',
  },
  GALLERY: {
    LIST: '/api/gallery',
    UPLOAD: '/api/gallery/upload',
    DOWNLOAD: '/api/gallery/download',
  },
} as const; 