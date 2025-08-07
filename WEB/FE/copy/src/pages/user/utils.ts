// 사용자 관련 유틸리티 함수들
import { UserDevice, MyPageTab } from './types';

/**
 * 사용자 기기 상태에 따른 색상 반환
 */
export const getDeviceStatusColor = (status: UserDevice['status']): string => {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'offline':
      return 'text-gray-600 bg-gray-100';
    case 'maintenance':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * 사용자 기기 상태 텍스트 반환
 */
export const getDeviceStatusText = (status: UserDevice['status']): string => {
  switch (status) {
    case 'online':
      return '온라인';
    case 'offline':
      return '오프라인';
    case 'maintenance':
      return '점검 중';
    default:
      return '알 수 없음';
  }
};

/**
 * 기기 타입에 따른 아이콘 반환
 */
export const getDeviceTypeIcon = (type: UserDevice['type']): string => {
  switch (type) {
    case 'drone':
      return '🛸';
    case 'controller':
      return '🎮';
    case 'sensor':
      return '📡';
    default:
      return '📱';
  }
};

/**
 * 마이페이지 탭 설정
 */
export const MY_PAGE_TABS: MyPageTab[] = [
  {
    id: 'profile',
    label: '내 정보 수정',
    icon: '👤'
  },
  {
    id: 'password',
    label: '비밀번호 변경',
    icon: '🔒'
  },
  {
    id: 'devices',
    label: '기기 관리',
    icon: '📱'
  }
];

/**
 * 비밀번호 강도 검사
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string;
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('최소 8자 이상');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('소문자 포함');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('대문자 포함');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('숫자 포함');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('특수문자 포함');

  const isValid = score >= 4;
  const feedbackText = feedback.length > 0 ? feedback.join(', ') : '강력한 비밀번호입니다';

  return { isValid, score, feedback: feedbackText };
}; 