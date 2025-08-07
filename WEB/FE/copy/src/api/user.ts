/**
 * 사용자 관련 API 함수
 * 백엔드 UserController와 연동
 */

import { apiClient } from './client';
import type { User } from '../types';

/**
 * 현재 사용자 정보 조회
 * GET /api/user/me
 */
export const userApi = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/user/me');
    return response.data;
  },
}; 