// API 관련 타입 정의

// 지역 관련 타입
export interface LocationRequestDto {
  name: string;
  description?: string;
}

export interface LocationResponseDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 드론 관련 타입
export interface DroneCreateRequestDto {
  name: string;
  model: string;
  serialNumber: string;
}

export interface DroneResponseDto {
  droneId: number;
  name: string;
  serialNumber: string;
  IvsArn: string;
}

// API 응답 공통 타입
export interface ApiResult<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 기존 타입들...
export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      email: string;
      name?: string;
      role: string;
    };
  };
}

export interface UserApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    name?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

// 기존 호환성을 위한 타입들 (점진적으로 제거 예정)
export interface DroneRegisterRequest {
  name: string;
  model: string;
  serialNumber: string;
}

export interface DroneResponse {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  status: string;
  registeredAt: string;
} 