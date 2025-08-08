// 기능별 페이지 관련 유틸리티 함수들
import { DetectionResult, RenderingTask, SettingsConfig } from './types';

/**
 * 탐지 결과 신뢰도에 따른 색상 반환
 */
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'text-green-600 bg-green-100';
  if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

/**
 * 탐지 결과 신뢰도 텍스트 반환
 */
export const getConfidenceText = (confidence: number): string => {
  if (confidence >= 0.8) return '높음';
  if (confidence >= 0.6) return '보통';
  return '낮음';
};

/**
 * 렌더링 작업 상태에 따른 색상 반환
 */
export const getRenderingStatusColor = (status: RenderingTask['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-gray-600 bg-gray-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * 렌더링 작업 상태 텍스트 반환
 */
export const getRenderingStatusText = (status: RenderingTask['status']): string => {
  switch (status) {
    case 'pending':
      return '대기 중';
    case 'processing':
      return '처리 중';
    case 'completed':
      return '완료';
    case 'failed':
      return '실패';
    default:
      return '알 수 없음';
  }
};

/**
 * 진행률에 따른 색상 반환
 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-blue-500';
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * 파일 크기 포맷팅
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 