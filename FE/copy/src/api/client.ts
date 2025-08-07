/**
 * Axios 기반 API 클라이언트
 * 토큰 자동 갱신 및 에러 처리 포함
 */

import axios, { type AxiosRequestConfig as AxiosRequestConfigType } from 'axios';
import { API_BASE_URL } from '../constants';

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// 쿠키에서 액세스 토큰 가져오기
const getAccessTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // 쿠키 자동 전송
});

// client로도 export (기존 코드 호환성)
export const client = apiClient;

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 쿠키에서 액세스 토큰 가져오기
    const token = getAccessTokenFromCookie();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // 이미 토큰 갱신 중인 경우 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청 (쿠키가 자동으로 전송됨)
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // 쿠키에서 새로운 액세스 토큰 가져오기
          const newAccessToken = getAccessTokenFromCookie();
          const tokenToUse = newAccessToken || accessToken;
          
          if (!tokenToUse) {
            throw new Error('새로운 액세스 토큰을 받지 못했습니다.');
          }
          
          // 대기 중인 요청들 처리
          processQueue(null, tokenToUse);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('토큰 갱신 실패');
        }
      } catch (refreshError) {
        // 대기 중인 요청들에 에러 전달
        processQueue(refreshError, null);
        
        // 로컬 스토리지 정리 (사용자 정보만)
        localStorage.removeItem('user');
        
        // 쿠키에서 토큰들 삭제
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 에러 처리 (권한 부족)
    if (error.response?.status === 403) {
      // 권한 부족 시에도 로그인 페이지로 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T>(
  config: AxiosRequestConfigType
): Promise<T> {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
} 