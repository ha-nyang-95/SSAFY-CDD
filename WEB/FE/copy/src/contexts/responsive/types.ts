/**
 * 반응형 관련 타입 정의
 */

import type { ReactNode } from 'react';

// 브레이크포인트 정의
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// 반응형 상태 타입
export interface ResponsiveState {
  // 화면 크기
  screenWidth: number;
  screenHeight: number;
  
  // 브레이크포인트별 상태
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1023px
  isDesktop: boolean;     // >= 1024px
  
  // 세부 브레이크포인트
  isSm: boolean;          // >= 640px
  isMd: boolean;          // >= 768px
  isLg: boolean;          // >= 1024px
  isXl: boolean;          // >= 1280px
  is2Xl: boolean;         // >= 1536px
  
  // 현재 브레이크포인트
  currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // 유틸리티 함수들
  isAbove: (breakpoint: keyof typeof BREAKPOINTS) => boolean;
  isBelow: (breakpoint: keyof typeof BREAKPOINTS) => boolean;
  isBetween: (min: keyof typeof BREAKPOINTS, max: keyof typeof BREAKPOINTS) => boolean;
}

// Provider Props
export interface ResponsiveProviderProps {
  children: ReactNode;
} 