// 지도 관련 유틸리티 함수들
import { MapLocation, FlightZone } from './types';

/**
 * 두 지점 간의 거리 계산 (미터 단위)
 */
export const calculateDistance = (point1: MapLocation, point2: MapLocation): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * 비행 구역 상태에 따른 색상 반환
 */
export const getFlightZoneColor = (status: FlightZone['status']): string => {
  switch (status) {
    case 'active':
      return '#10B981'; // green-500
    case 'inactive':
      return '#6B7280'; // gray-500
    case 'restricted':
      return '#EF4444'; // red-500
    default:
      return '#6B7280';
  }
};

/**
 * 위도/경도 포맷팅
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const latStr = Math.abs(lat).toFixed(6);
  const lngStr = Math.abs(lng).toFixed(6);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${latStr}°${latDir}, ${lngStr}°${lngDir}`;
};

/**
 * 지도 줌 레벨에 따른 반경 계산 (픽셀 단위)
 */
export const calculateRadiusInPixels = (radius: number, zoom: number): number => {
  // 대략적인 계산 (실제로는 지도 라이브러리에 따라 다를 수 있음)
  const metersPerPixel = 156543.03392 * Math.cos(0) / Math.pow(2, zoom);
  return radius / metersPerPixel;
}; 