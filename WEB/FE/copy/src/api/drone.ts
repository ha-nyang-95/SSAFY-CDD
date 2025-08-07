/**
 * 드론 관련 API 함수들 - Axios 기반
 */

import { client } from './client';
import type { DroneCreateRequestDto, DroneResponseDto, ApiResult } from '../types/api';

/**
 * 드론 등록
 */
export const registerDrone = async (droneData: DroneCreateRequestDto): Promise<DroneResponseDto> => {
  const response = await client.post<ApiResult<DroneResponseDto>>('/api/drone/register', droneData);
  return response.data.data;
};

/**
 * 내 드론 정보 조회
 */
export const getMyDrone = async (): Promise<DroneResponseDto> => {
  const response = await client.get<ApiResult<DroneResponseDto>>('/api/drone/me');
  return response.data.data;
};

/**
 * 드론 등록 여부 확인
 */
export const checkDroneExist = async (): Promise<boolean> => {
  const response = await client.get<ApiResult<boolean>>('/api/drone/exist');
  return response.data.data;
}; 