// 기능별 페이지 관련 타입 정의

export interface DetectionResult {
  id: string;
  timestamp: Date;
  confidence: number;
  category: string;
  location?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
}

export interface RenderingTask {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface SettingsConfig {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareData: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ko' | 'en';
  };
} 