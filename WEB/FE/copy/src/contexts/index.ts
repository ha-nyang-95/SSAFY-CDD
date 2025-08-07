/**
 * 컨텍스트 모듈 통합 export
 * 
 * [역할]
 * - React Context API를 통한 전역 상태 관리
 * - Provider 컴포넌트들을 제공하여 앱 전체에 상태 공급
 * - 상태 변경 로직과 비즈니스 로직을 포함
 * 
 * [hooks/common과의 차이점]
 * - contexts: Provider 컴포넌트와 상태 관리 로직 제공
 * - hooks/common: contexts의 상태를 사용하는 편의 훅 제공
 * 
 * [사용 예시]
 * - App.tsx에서 Provider로 감싸기: <AuthProvider><ResponsiveProvider>
 * - 컴포넌트에서 상태 사용: useAuth(), useResponsive()
 */

// 인증 도메인 export
export { AuthProvider, useAuth } from './auth';
export type { AuthContextType, AuthProviderProps, AuthState } from './auth';

// 반응형 도메인 export
export { ResponsiveProvider, useResponsive } from './responsive';
export type { ResponsiveState, ResponsiveProviderProps } from './responsive'; 