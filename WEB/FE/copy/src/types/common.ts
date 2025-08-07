/**
 * 공통 타입 정의
 */

// API 응답 타입 - 백엔드 ApiResult에 맞게 수정
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: number;
  data: T | null;
}

export interface ApiError {
  success: false;
  message: string;
  code: number;
  data: null;
}

// 공통 컴포넌트 Props 타입
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
} 