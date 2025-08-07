// 기능별 페이지 관련 상수들

export const DETECTION_CATEGORIES = [
  'crack',
  'damage',
  'corrosion',
  'leak',
  'wear',
  'other'
] as const;

export const DETECTION_CONFIDENCE_LEVELS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
} as const;

export const RENDERING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const RENDERING_PROGRESS_STAGES = [
  { stage: 'upload', label: '파일 업로드', progress: 10 },
  { stage: 'analysis', label: '분석 중', progress: 30 },
  { stage: 'processing', label: '처리 중', progress: 60 },
  { stage: 'rendering', label: '렌더링 중', progress: 90 },
  { stage: 'complete', label: '완료', progress: 100 }
] as const;

export const SETTINGS_CATEGORIES = {
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  DISPLAY: 'display',
  SECURITY: 'security'
} as const;

export const THEME_OPTIONS = [
  { value: 'light', label: '라이트 모드', icon: '☀️' },
  { value: 'dark', label: '다크 모드', icon: '🌙' },
  { value: 'auto', label: '시스템 설정', icon: '⚙️' }
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' }
] as const;

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms'
} as const;

export const PRIVACY_SETTINGS = {
  SHARE_LOCATION: 'shareLocation',
  SHARE_DATA: 'shareData',
  ANALYTICS: 'analytics'
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 5 * 1024 * 1024 // 5MB
} as const;

export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  VIDEO: ['.mp4', '.avi', '.mov', '.wmv'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt']
} as const; 