/**
 * 인증 상태 관리 Context
 * 분리된 로직들을 조합하여 인증 상태를 관리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthContextType, AuthProviderProps, AuthState } from './types';
import { 
  initializeAuth, 
  handleLogin, 
  handleSignUp, 
  handleLogout, 
  handleRefreshToken, 
  handleCheckAuthStatus,
  checkPermission 
} from './authLogic';

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 인증 Provider 컴포넌트
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
  });

  // 초기 인증 상태 확인 (앱 시작 시 1회만 실행)
  useEffect(() => {
    initializeAuth(setAuthState);
  }, []); // 빈 의존성 배열로 1회만 실행

  // 로그인 함수
  const login = useCallback(async (credentials) => {
    return handleLogin(credentials, setAuthState);
  }, []);

  // 회원가입 함수
  const signUp = useCallback(async (userData) => {
    return handleSignUp(userData, setAuthState);
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    return handleLogout(setAuthState);
  }, []);

  // 토큰 갱신 함수
  const refreshToken = useCallback(async () => {
    return handleRefreshToken(setAuthState);
  }, []);

  // 인증 상태 확인 함수
  const checkAuthStatus = useCallback(async () => {
    return handleCheckAuthStatus(setAuthState);
  }, []);

  // 권한 확인 함수
  const hasPermission = useCallback((action: string, resource: string) => {
    return checkPermission(authState.user, action, resource);
  }, [authState.user]);

  const contextValue: AuthContextType = {
    ...authState, 
    login, 
    signUp, 
    logout, 
    refreshToken, 
    checkAuthStatus, 
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth 훅
 * AuthContext를 사용하기 위한 커스텀 훅
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다.');
  }
  
  return context;
} 