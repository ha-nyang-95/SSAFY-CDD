/**
 * 인증 관련 API 함수
 * 백엔드 AuthController와 연동
 */

import { apiClient } from './client';
import type { LoginRequest, SignUpRequest, TokenResponse, User } from '../types';

/**
 * 회원가입
 * POST /api/auth/signUp
 */
export const authApi = {
  signUp: async (userData: SignUpRequest) => {
    const response = await apiClient.post('/api/auth/signUp', userData);
    return response.data;
  },

  /**
   * 로그인
   * POST /api/auth/login
   * 토큰은 쿠키에 자동으로 저장됨
   */
  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * 토큰 갱신
   * POST /api/auth/refresh
   * 리프레시 토큰은 쿠키에서 자동으로 전송됨
   */
  refreshToken: async () => {
    const response = await apiClient.post('/api/auth/refresh');
    return response.data;
  },

  /**
   * 로그아웃
   * POST /api/auth/logout
   * 쿠키에서 토큰 삭제
   */
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
}; 