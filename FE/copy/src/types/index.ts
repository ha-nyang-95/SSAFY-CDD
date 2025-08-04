/**
 * 타입 정의 통합 관리
 */

// API 관련 타입
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

// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string; // 실제 이름
  username?: string; // 기존 호환성을 위한 선택적 필드
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// 드론 관련 타입
export interface DroneData {
  id: string;
  name: string;
  model: string;
  status: string;
  batteryLevel: number;
  isActive: boolean;
  lastUpdate: string;
  registeredAt: string;
}

export interface DroneRegisterRequest {
  name: string;
  model: string;
  serialNumber: string;
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