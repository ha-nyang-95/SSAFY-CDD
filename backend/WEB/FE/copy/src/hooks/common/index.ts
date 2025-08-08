/**
 * 공통 훅 통합 관리
 * 
 * [역할]
 * - contexts에서 제공하는 전역 상태를 사용하는 편의 훅들
 * - 컴포넌트에서 쉽게 사용할 수 있는 인터페이스 제공
 * - contexts의 복잡한 로직을 추상화하여 단순한 API 제공
 * 
 * [contexts와의 차이점]
 * - contexts: Provider 컴포넌트와 상태 관리 로직 (복잡한 비즈니스 로직 포함)
 * - hooks/common: contexts의 상태를 사용하는 편의 훅 (단순한 인터페이스)
 * 
 * [사용 예시]
 * - 컴포넌트에서: import { useResponsive } from '../hooks/common'
 * - 내부적으로: contexts/responsive의 useResponsive를 호출
 */

export { useResponsive } from './useResponsive'; 