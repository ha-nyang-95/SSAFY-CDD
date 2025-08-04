/**
 * 인증 관련 커스텀 훅
 * AuthContext를 사용하여 인증 상태 관리
 */

import { useAuth as useAuthContext } from '../../contexts/auth';

/**
 * useAuth 훅 - AuthContext의 useAuth를 재export
 * 기존 코드와의 호환성을 위해 유지
 */
export function useAuth() {
  return useAuthContext();
} 