/**
 * 인증 도메인 모듈
 * 인증 관련 모든 기능을 통합하여 제공
 */

// 타입 export
export type { AuthContextType, AuthProviderProps, AuthState } from './types';

// 컴포넌트 export
export { AuthProvider, useAuth } from './AuthContext';

// 유틸리티 함수들 export
export { authStorage } from './storage';
export { 
  initializeAuth,
  handleLogin,
  handleSignUp,
  handleLogout,
  handleRefreshToken,
  handleCheckAuthStatus,
  checkPermission
} from './authLogic'; 