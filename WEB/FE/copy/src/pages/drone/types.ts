// 드론 관련 타입 정의

export interface DroneInfo {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'online' | 'offline' | 'flying' | 'maintenance';
  batteryLevel: number;
  lastSeen?: Date;
}

export interface DroneRegistrationData {
  name: string;
  model: string;
  serialNumber: string;
  description?: string;
}

export interface DroneRegistrationFormProps {
  onSubmit: (data: DroneRegistrationData) => void;
  isLoading?: boolean;
} 