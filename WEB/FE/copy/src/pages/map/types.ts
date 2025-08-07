// 지도 관련 타입 정의

export interface MapLocation {
  lat: number;
  lng: number;
}

export interface FlightZone {
  id: string;
  name: string;
  center: MapLocation;
  radius: number;
  status: 'active' | 'inactive' | 'restricted';
  description?: string;
}

export interface MapMarker {
  id: string;
  position: MapLocation;
  type: 'current-location' | 'drone' | 'waypoint';
  color?: string;
  title?: string;
}

export interface MapCircle {
  id: string;
  center: MapLocation;
  radius: number;
  color: string;
  title?: string;
}

export interface MapPageProps {
  initialCenter?: MapLocation;
  initialZoom?: number;
} 