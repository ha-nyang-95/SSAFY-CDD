/**
 * 컴포넌트 통합 관리
 * 느슨한 연결을 위한 중앙 집중식 export
 */

// Dashboard 컴포넌트들
export { default as DashboardWelcome } from './dashboard/DashboardWelcome';

// Dashboard 섹션 컴포넌트들
export { default as CrackLiveSection } from './dashboard/sections/CrackLiveSection';
export { default as HistorySection } from './dashboard/sections/HistorySection';
export { default as RenderingSection } from './dashboard/sections/RenderingSection';

// 공통 컴포넌트들
export * from './common';

// UI 컴포넌트들
export * from './ui';

// 메뉴 컴포넌트들 (헤더, 푸터, 사이드바 포함)
export * from './menu';

// 지도 컴포넌트들
export { default as VWorldMap } from './map/VWorldMap'; 