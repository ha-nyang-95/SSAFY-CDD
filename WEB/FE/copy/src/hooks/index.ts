/**
 * 커스텀 훅 통합 관리
 * 
 * [전체 구조]
 * - auth/: 인증 관련 훅 (useAuth) - 독립적으로 구현
 * - common/: 공통 훅 (useResponsive) - 독립적으로 구현
 * - domain/: 도메인별 훅 (useDrone, useLocation 등) - 특정 기능의 상태 관리
 * 
 * [역할별 구분]
 * - auth: 인증 상태 관리 훅 (독립 구현)
 * - common: 반응형 상태 관리 훅 (독립 구현)
 * - domain: 특정 도메인의 비즈니스 로직을 관리하는 훅들
 * 
 * [순환 참조 방지]
 * - contexts에 의존하지 않고 독립적으로 구현
 * - 각 훅은 자체적으로 상태를 관리
 * 
 * [사용 예시]
 * - 인증: import { useAuth } from '../hooks'
 * - 반응형: import { useResponsive } from '../hooks'
 * - 도메인: import { useDrone } from '../hooks'
 */

// 인증 관련 훅 (독립 구현)
export { useAuth } from './auth';

// 공통 훅들 (독립 구현)
export { useResponsive } from './common';

// 도메인별 훅 (특정 기능의 상태 관리)
export * from './domain'; 