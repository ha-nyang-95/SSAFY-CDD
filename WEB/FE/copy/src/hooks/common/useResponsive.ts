/**
 * 반응형 상태 관리 훅
 * ResponsiveContext에서 제공하는 반응형 상태를 사용
 */

import { useResponsive as useResponsiveContext } from '../../contexts/responsive';

export function useResponsive() {
  return useResponsiveContext();
} 