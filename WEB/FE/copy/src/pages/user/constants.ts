// 사용자 관련 상수들

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true
} as const;

export const USER_PROFILE_FIELDS = {
  name: {
    label: '이름',
    placeholder: '사용자 이름을 입력하세요',
    required: true,
    maxLength: 50
  },
  email: {
    label: '이메일',
    placeholder: '이메일 주소를 입력하세요',
    required: true,
    type: 'email'
  },
  emailNotifications: {
    label: '이메일 알림',
    description: '중요한 업데이트와 알림을 이메일로 받습니다'
  }
} as const;

export const PASSWORD_CHANGE_FIELDS = {
  currentPassword: {
    label: '현재 비밀번호',
    placeholder: '현재 비밀번호를 입력하세요',
    required: true,
    type: 'password'
  },
  newPassword: {
    label: '새 비밀번호',
    placeholder: '새 비밀번호를 입력하세요',
    required: true,
    type: 'password'
  },
  confirmPassword: {
    label: '새 비밀번호 확인',
    placeholder: '새 비밀번호를 다시 입력하세요',
    required: true,
    type: 'password'
  }
} as const;

export const DEVICE_TYPES = [
  { value: 'drone', label: '드론', icon: '🛸' },
  { value: 'controller', label: '컨트롤러', icon: '🎮' },
  { value: 'sensor', label: '센서', icon: '📡' }
] as const;

export const DEVICE_STATUS_OPTIONS = [
  { value: 'online', label: '온라인' },
  { value: 'offline', label: '오프라인' },
  { value: 'maintenance', label: '점검 중' }
] as const;

export const MY_PAGE_TAB_CONFIG = [
  {
    id: 'profile',
    label: '내 정보 수정',
    icon: '👤',
    description: '개인 정보를 수정할 수 있습니다'
  },
  {
    id: 'password',
    label: '비밀번호 변경',
    icon: '🔒',
    description: '계정 보안을 위해 비밀번호를 변경할 수 있습니다'
  },
  {
    id: 'devices',
    label: '기기 관리',
    icon: '📱',
    description: '등록된 기기들을 관리할 수 있습니다'
  }
] as const; 