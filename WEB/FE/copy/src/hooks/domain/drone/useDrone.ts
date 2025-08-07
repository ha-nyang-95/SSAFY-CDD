/**
 * 드론 관련 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { registerDrone, getMyDrone, checkDroneExist } from '../../../api/drone';
import type { DroneCreateRequestDto, DroneResponseDto } from '../../../types/api';

// 드론 상태 타입
interface DroneState {
  drone: DroneResponseDto | null;
  exists: boolean | null;
  isLoading: boolean;
  error: string | null;
}

// 드론 훅 반환 타입
interface UseDroneReturn extends DroneState {
  checkDroneExist: () => Promise<void>;
  registerDrone: (data: DroneCreateRequestDto) => Promise<void>;
  getMyDrone: () => Promise<void>;
  clearDrone: () => void;
}

export const useDrone = (): UseDroneReturn => {
  const [droneState, setDroneState] = useState<DroneState>({
    drone: null,
    exists: null,
    isLoading: false,
    error: null,
  });

  // 드론 존재 여부 확인
  const checkDroneExistHandler = useCallback(async () => {
    setDroneState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const exists = await checkDroneExist();
      setDroneState(prev => ({
        ...prev,
        exists,
        isLoading: false,
      }));
    } catch (error) {
      setDroneState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : '드론 존재 여부 확인에 실패했습니다.'
      }));
      throw error;
    }
  }, []);

  // 드론 등록
  const registerDroneHandler = useCallback(async (data: DroneCreateRequestDto) => {
    setDroneState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newDrone = await registerDrone(data);
      setDroneState({
        drone: newDrone,
        exists: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setDroneState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : '드론 등록에 실패했습니다.'
      }));
      throw error;
    }
  }, []);

  // 내 드론 정보 조회
  const getMyDroneHandler = useCallback(async () => {
    setDroneState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const drone = await getMyDrone();
      setDroneState({
        drone,
        exists: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setDroneState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : '드론 정보 조회에 실패했습니다.'
      }));
      throw error;
    }
  }, []);

  // 드론 상태 초기화
  const clearDrone = useCallback(() => {
    setDroneState({
      drone: null,
      exists: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...droneState,
    checkDroneExist: checkDroneExistHandler,
    registerDrone: registerDroneHandler,
    getMyDrone: getMyDroneHandler,
    clearDrone,
  };
}; 