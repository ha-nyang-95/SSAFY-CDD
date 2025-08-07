// 드론 관련 상수들

export const DRONE_MODELS = [
  'DJI Inspire 2',
  'DJI Phantom 4 Pro',
  'DJI Mavic 2 Pro',
  'DJI Air 2S',
  'DJI Mini 3 Pro',
  'DJI Avata',
  'DJI FPV',
  'DJI NEO',
  '기타'
] as const;

export const DRONE_STATUS_OPTIONS = [
  { value: 'online', label: '온라인' },
  { value: 'offline', label: '오프라인' },
  { value: 'flying', label: '비행 중' },
  { value: 'maintenance', label: '점검 중' }
] as const;

export const BATTERY_WARNING_THRESHOLD = 20; // 20% 이하 시 경고
export const BATTERY_CRITICAL_THRESHOLD = 10; // 10% 이하 시 위험

export const DRONE_REGISTRATION_FIELDS = {
  name: {
    label: '드론 이름',
    placeholder: '드론의 이름을 입력하세요',
    required: true,
    maxLength: 50
  },
  model: {
    label: '드론 모델',
    placeholder: '드론 모델을 선택하세요',
    required: true
  },
  serialNumber: {
    label: '시리얼 번호',
    placeholder: '드론의 시리얼 번호를 입력하세요',
    required: true,
    pattern: /^[A-Z0-9-]{8,20}$/
  },
  description: {
    label: '설명 (선택사항)',
    placeholder: '드론에 대한 추가 설명을 입력하세요',
    required: false,
    maxLength: 200
  }
} as const; 