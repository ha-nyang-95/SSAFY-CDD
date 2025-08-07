// 지역 관련 API 함수들
import { client } from './client';
import type { LocationRequestDto, LocationResponseDto, ApiResult } from '../types/api';

/**
 * 지역 등록
 */
export const registerLocation = async (locationData: LocationRequestDto): Promise<LocationResponseDto> => {
  const response = await client.post<ApiResult<LocationResponseDto>>('/api/location/register', locationData);
  return response.data.data;
};

/**
 * 지역 삭제
 */
export const deleteLocation = async (locationId: number): Promise<void> => {
  await client.delete(`/api/location/remove/${locationId}`);
};

/**
 * 지역 목록 조회
 */
export const getLocations = async (): Promise<LocationResponseDto[]> => {
  const response = await client.get<ApiResult<LocationResponseDto[]>>('/api/location/list');
  return response.data.data;
}; 