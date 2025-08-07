// 지역 관리 커스텀 훅
import { useState, useCallback } from 'react';
import { registerLocation, deleteLocation, getLocations } from '../../../api/location';
import type { LocationRequestDto, LocationResponseDto } from '../../../types/api';

export const useLocation = () => {
  const [locations, setLocations] = useState<LocationResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지역 목록 조회
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '지역 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 지역 추가
  const addLocation = useCallback(async (locationData: LocationRequestDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLocation = await registerLocation(locationData);
      setLocations(prev => [...prev, newLocation]);
      return newLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '지역 추가에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 지역 삭제
  const removeLocation = useCallback(async (locationId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteLocation(locationId);
      setLocations(prev => prev.filter(location => location.id !== locationId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '지역 삭제에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    addLocation,
    removeLocation
  };
}; 