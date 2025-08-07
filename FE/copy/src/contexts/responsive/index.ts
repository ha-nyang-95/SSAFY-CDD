/**
 * 반응형 도메인 모듈
 * 반응형 관련 모든 기능을 통합하여 제공
 */

// 타입 export
export type { ResponsiveState, ResponsiveProviderProps } from './types';
export { BREAKPOINTS } from './types';

// 컴포넌트 export
export { ResponsiveProvider, useResponsive } from './ResponsiveContext';

// 유틸리티 함수들 export
export { 
  getCurrentBreakpoint,
  calculateBreakpointStates,
  createResponsiveUtils
} from './responsiveLogic'; 