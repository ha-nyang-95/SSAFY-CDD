/**
 * 반응형 관련 비즈니스 로직
 */

import type { ResponsiveState, ResponsiveProviderProps } from './types';
import { BREAKPOINTS } from './types';

/**
 * 현재 화면 크기에 따른 브레이크포인트 계산
 */
export const getCurrentBreakpoint = (width: number): ResponsiveState['currentBreakpoint'] => {
  if (width >= BREAKPOINTS['2XL']) return '2xl';
  if (width >= BREAKPOINTS.XL) return 'xl';
  if (width >= BREAKPOINTS.LG) return 'lg';
  if (width >= BREAKPOINTS.MD) return 'md';
  if (width >= BREAKPOINTS.SM) return 'sm';
  return 'xs';
};

/**
 * 브레이크포인트별 상태 계산
 */
export const calculateBreakpointStates = (screenWidth: number, screenHeight: number) => {
  // 세부 브레이크포인트
  const isSm = screenWidth >= BREAKPOINTS.SM;
  const isMd = screenWidth >= BREAKPOINTS.MD;
  const isLg = screenWidth >= BREAKPOINTS.LG;
  const isXl = screenWidth >= BREAKPOINTS.XL;
  const is2Xl = screenWidth >= BREAKPOINTS['2XL'];

  // 디바이스 타입별 상태
  const isMobile = screenWidth < BREAKPOINTS.MD;
  const isTablet = screenWidth >= BREAKPOINTS.MD && screenWidth < BREAKPOINTS.LG;
  const isDesktop = screenWidth >= BREAKPOINTS.LG;

  // 현재 브레이크포인트
  const currentBreakpoint = getCurrentBreakpoint(screenWidth);

  return {
    screenWidth,
    screenHeight,
    isMobile,
    isTablet,
    isDesktop,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    currentBreakpoint,
  };
};

/**
 * 반응형 유틸리티 함수들 생성
 */
export const createResponsiveUtils = (screenWidth: number) => {
  const isAbove = (breakpoint: keyof typeof BREAKPOINTS) => {
    return screenWidth >= BREAKPOINTS[breakpoint];
  };

  const isBelow = (breakpoint: keyof typeof BREAKPOINTS) => {
    return screenWidth < BREAKPOINTS[breakpoint];
  };

  const isBetween = (min: keyof typeof BREAKPOINTS, max: keyof typeof BREAKPOINTS) => {
    return screenWidth >= BREAKPOINTS[min] && screenWidth < BREAKPOINTS[max];
  };

  return { isAbove, isBelow, isBetween };
}; 