// 드론 관련 유틸리티 함수들
import { DroneInfo } from './types';

/**
 * 드론 상태에 따른 색상 반환
 */
export const getDroneStatusColor = (status: DroneInfo['status']): string => {
  switch (status) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'offline':
      return 'text-gray-600 bg-gray-100';
    case 'flying':
      return 'text-blue-600 bg-blue-100';
    case 'maintenance':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * 드론 상태 텍스트 반환
 */
export const getDroneStatusText = (status: DroneInfo['status']): string => {
  switch (status) {
    case 'online':
      return '온라인';
    case 'offline':
      return '오프라인';
    case 'flying':
      return '비행 중';
    case 'maintenance':
      return '점검 중';
    default:
      return '알 수 없음';
  }
};

/**
 * 배터리 레벨에 따른 색상 반환
 */
export const getBatteryColor = (level: number): string => {
  if (level > 50) return 'text-green-600';
  if (level > 20) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * 시리얼 번호 유효성 검사
 */
export const validateSerialNumber = (serialNumber: string): boolean => {
  // 기본적인 형식 검사 (영문자, 숫자, 하이픈 조합)
  const serialNumberRegex = /^[A-Z0-9-]{8,20}$/;
  return serialNumberRegex.test(serialNumber);
}; 