/**
 * 반응형 상태 관리 Context
 * 분리된 로직들을 조합하여 반응형 상태를 관리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { ResponsiveState, ResponsiveProviderProps } from './types';
import { calculateBreakpointStates, createResponsiveUtils } from './responsiveLogic';

// Context 생성
const ResponsiveContext = createContext<ResponsiveState | undefined>(undefined);

/**
 * 반응형 Provider 컴포넌트
 */
export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  // 화면 크기 변화 감지
  const handleResize = useCallback(() => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    // SSR 환경에서 window 객체 확인
    if (typeof window === 'undefined') return;

    // 초기 크기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    
    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 브레이크포인트별 상태 계산
  const breakpointStates = calculateBreakpointStates(screenSize.width, screenSize.height);
  
  // 유틸리티 함수들 생성
  const responsiveUtils = createResponsiveUtils(screenSize.width);

  const contextValue: ResponsiveState = {
    ...breakpointStates,
    ...responsiveUtils,
  };

  return (
    <ResponsiveContext.Provider value={contextValue}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/**
 * useResponsive 훅
 * ResponsiveContext를 사용하기 위한 커스텀 훅
 */
export function useResponsive(): ResponsiveState {
  const context = useContext(ResponsiveContext);
  
  if (context === undefined) {
    throw new Error('useResponsive는 ResponsiveProvider 내부에서 사용되어야 합니다.');
  }
  
  return context;
} 