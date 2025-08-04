// 지도 관련 상수들

export const DEFAULT_MAP_CENTER = {
  lat: 37.5665, // 서울 시청
  lng: 126.9780
} as const;

export const DEFAULT_MAP_ZOOM = 13;

export const MAP_ZOOM_LEVELS = {
  WORLD: 1,
  COUNTRY: 5,
  CITY: 10,
  DISTRICT: 15,
  STREET: 18,
  BUILDING: 20
} as const;

export const FLIGHT_ZONE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RESTRICTED: 'restricted'
} as const;

export const MAP_MARKER_COLORS = {
  CURRENT_LOCATION: '#8B5CF6', // purple-500
  DRONE: '#3B82F6', // blue-500
  WAYPOINT: '#10B981', // green-500
  RESTRICTED: '#EF4444' // red-500
} as const;

export const MAP_CIRCLE_COLORS = {
  ACTIVE_ZONE: '#10B981', // green-500
  INACTIVE_ZONE: '#6B7280', // gray-500
  RESTRICTED_ZONE: '#EF4444', // red-500
  WARNING_ZONE: '#F59E0B' // yellow-500
} as const;

export const LOCATION_PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt'
} as const;

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000
} as const; 