/**
 * 인증 관련 비즈니스 로직
 */

import { authApi, userApi } from '../../api';
import type { User, LoginRequest, SignUpRequest } from '../../types';
import type { AuthState } from './types';
import { authStorage } from './storage';

/**
 * 인증 상태 업데이트 함수 타입
 */
export type AuthStateUpdater = (state: AuthState | ((prev: AuthState) => AuthState)) => void;

/**
 * 초기 인증 상태 확인 로직
 */
export const initializeAuth = async (updater: AuthStateUpdater): Promise<void> => {
  try {
    const localUser = authStorage.getUser();
    const localAuthStatus = authStorage.getAuthStatus();

    if (localUser && localAuthStatus) {
      // 로컬에 사용자 정보가 있으면 서버에서 확인
      try {
        const userResponse = await userApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          updater({
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return;
        }
      } catch (error) {
        // 서버 확인 실패 시 로컬 정보로 초기화
        updater({
          user: localUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      }
    }

    // 인증되지 않은 상태
    updater({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  } catch (error) {
    updater({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: '인증 초기화 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 로그인 로직
 */
export const handleLogin = async (
  credentials: LoginRequest,
  setAuthState: AuthStateUpdater
): Promise<{ success: boolean; error?: string }> => {
  try {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true }));
    
    const response = await authApi.login(credentials);
    
    if (response.success) {
      
      // 로그인 성공 후 사용자 정보 조회
      try {
        const userResponse = await userApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          
          // 로컬 스토리지에 저장
          authStorage.setAuthStatus(true);
          authStorage.setUser(userResponse.data);
          
          setAuthState({
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return { success: true };
        } else {
          throw new Error('사용자 정보 조회 실패');
        }
      } catch (userError) {
        console.error('사용자 정보 조회 실패:', userError);
        
        // 로그아웃 처리
        authStorage.clearAuth();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: '사용자 정보 조회에 실패했습니다.'
        });
        return { success: false, error: '사용자 정보 조회에 실패했습니다.' };
      }
    } else {
      setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
      return { success: false, error: response.message || '로그인에 실패했습니다.' };
    }
  } catch (error) {
    console.error('로그인 중 오류:', error);
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: false }));
    return { success: false, error: '로그인 중 오류가 발생했습니다.' };
  }
};

/**
 * 회원가입 로직
 */
export const handleSignUp = async (
  userData: SignUpRequest,
  setAuthState: AuthStateUpdater
): Promise<{ success: boolean; error?: string }> => {
  try {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authApi.signUp(userData);
    
    if (response.success) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } else {
      console.error('❌ 회원가입 실패:', response.message);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: response.message || '회원가입에 실패했습니다.' };
    }
  } catch (error) {
    console.error('�� 회원가입 중 오류:', error);
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
  }
};

/**
 * 로그아웃 로직
 */
export const handleLogout = async (
  setAuthState: AuthStateUpdater
): Promise<{ success: boolean; error?: string }> => {
  try {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authApi.logout();
    
    // 로컬 스토리지 초기화
    authStorage.clearAuth();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    return { success: true };
  } catch (error) {
    console.error('🚨 로그아웃 중 오류:', error);
    
    // 로그아웃 API 실패해도 클라이언트 상태는 초기화
    authStorage.clearAuth();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
  }
};

/**
 * 토큰 갱신 로직
 */
export const handleRefreshToken = async (
  setAuthState: AuthStateUpdater
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authApi.refreshToken();
    
    if (response.success) {
      
      // 토큰 재발급 성공 후 사용자 상태 조회
      try {
        const userResponse = await userApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          
          // 로컬 스토리지에 저장
          authStorage.setAuthStatus(true);
          authStorage.setUser(userResponse.data);
          
          setAuthState({
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          return { success: true };
        } else {
          // 사용자 정보 조회 실패 시 로그아웃 상태로 처리
          
          // 로컬 스토리지 초기화
          authStorage.clearAuth();
          
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: '사용자 상태 확인에 실패했습니다.'
          });
          return { success: false, error: '사용자 상태 확인에 실패했습니다.' };
        }
      } catch (userError) {
        console.error('토큰 재발급 후 사용자 상태 확인 중 오류:', userError);
        
        // 접근 에러나 null 응답 시 로그아웃 상태로 처리
        authStorage.clearAuth();
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: '사용자 상태 확인 중 오류가 발생했습니다.'
        });
        return { success: false, error: '사용자 상태 확인 중 오류가 발생했습니다.' };
      }
    } else {
      console.error('토큰 재발급 실패:', response.message);
      
      // 토큰 재발급 실패 시 로그아웃 상태로 처리
      authStorage.clearAuth();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: '토큰 재발급에 실패했습니다.'
      });
      return { success: false, error: response.message || '토큰 재발급에 실패했습니다.' };
    }
  } catch (error) {
    console.error('토큰 재발급 중 오류:', error);
    
    // 토큰 재발급 중 오류 발생 시 로그아웃 상태로 처리
    authStorage.clearAuth();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: '토큰 재발급 중 오류가 발생했습니다.'
    });
    return { success: false, error: '토큰 재발급 중 오류가 발생했습니다.' };
  }
};

/**
 * 인증 상태 확인 로직
 */
export const handleCheckAuthStatus = async (
  setAuthState: AuthStateUpdater
): Promise<{ success: boolean; user?: User }> => {
  try {
    const userResponse = await userApi.getCurrentUser();
    
    if (userResponse.success && userResponse.data) {
      
      // 로컬 스토리지에 저장
      authStorage.setAuthStatus(true);
      authStorage.setUser(userResponse.data);
      
      setAuthState({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      return { success: true, user: userResponse.data };
    } else {
      // 로컬 스토리지 초기화
      authStorage.clearAuth();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return { success: false };
    }
  } catch (error) {
    console.error('인증 상태 확인 중 오류:', error);
    
    // 오류 발생 시 로컬 스토리지 초기화
    authStorage.clearAuth();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    return { success: false };
  }
};

/**
 * 권한 확인 로직
 */
export const checkPermission = (user: User | null, action: string, resource: string): boolean => {
  if (!user) return false;
  
  // 관리자는 모든 권한을 가짐
  if (user.role === 'ADMIN') return true;
  
  // 일반 사용자 권한 체크 (필요에 따라 확장)
  const permissions = {
    'read': ['dashboard', 'detection', 'rendering'],
    'write': ['settings'],
  };
  
  return permissions[action as keyof typeof permissions]?.includes(resource) || false;
}; 