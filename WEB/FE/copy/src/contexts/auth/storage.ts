/**
 * 인증 관련 로컬 스토리지 헬퍼 함수들
 */

import type { User } from '../../types';

// 로컬 스토리지 키
const AUTH_STORAGE_KEY = 'auth_status';
const AUTH_USER_KEY = 'auth_user';

/**
 * 로컬 스토리지 헬퍼 객체
 */
export const authStorage = {
  // 로그인 상태 저장
  setAuthStatus: (isAuthenticated: boolean) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error('🚨 로컬 스토리지 저장 실패:', error);
    }
  },

  // 로그인 상태 불러오기
  getAuthStatus: (): boolean => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.error('🚨 로컬 스토리지 읽기 실패:', error);
      return false;
    }
  },

  // 사용자 정보 저장
  setUser: (user: User | null) => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (error) {
      console.error('🚨 사용자 정보 저장 실패:', error);
    }
  },

  // 사용자 정보 불러오기
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('🚨 사용자 정보 읽기 실패:', error);
      return null;
    }
  },

  // 모든 인증 데이터 삭제
  clearAuth: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.error('🚨 인증 데이터 삭제 실패:', error);
    }
  }
}; 