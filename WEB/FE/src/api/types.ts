export type ApiResult<T> = {
  success: boolean;
  message: string;
  code: number;
  data: T | null;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type SignUpRequestDto = {
  email: string;
  password: string;
  name: string;
  regionName?: string; // 한글 지역명 그대로 전달 (백엔드 DTO 필드명에 맞춤)
};


export type UserResponseDto = {
  userId: number;
  email: string;
  username: string;
  role: string;
  // 한국어 주석: 사용자 기본 지역(시/도) 표시용. 예: "경기도 성남시 분당구" 또는 "서울특별시 강남구"
  regionName?: string;
};

// 쿠키 기반 인증으로 전환하면서 TokenResponseDto는 더 이상 사용하지 않습니다.

export type TaskResponseDto = {
  taskId: number;
  locationName: string; // 목록 조회 응답의 지역 이름 필드
  createdAt: string; // 생성 시각 (ISO)
  status: 'ACTIVE' | 'INACTIVE'; // 작업 상태 (ACTIVE=진행중, INACTIVE=완료)
  description?: string; // 작업 메모(설명)
};

export type TaskFirstResponseDto = {
  taskId: number;
  userId: number;
  location: string;
  s3Name: string; // 세션 식별자로 활용
};

export type CrackResponseDto = {
  crackId: number;
  crackName: string; // 균열 이름 (예: crack_001, crack_002)
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  activatedAt: string;
  deactivatedAt: string | null;
  imageS3Url?: string;
  segmentS3Url?: string;
  lidarS3Url?: string;
};

export type TaskDetailResponseDto = {
  taskId: number;
  locationName: string;
  detectionURL: string | null;
  modelingURL: string | null;
  videoURL: string | null;
  cracks: CrackResponseDto[];
  description?: string; // 작업 메모(설명)
  activatedAt?: string; // 작업 시작/활성 시간 (헤더 날짜 표시용)
};

// 기존 FE 타입 유지 (호환 목적)
export type InspectionStatus = 'LIVE' | 'COMPLETED';

export interface Inspection {
  id: string;
  name: string;
  sessionId: string;
  date: string; // ISO string
  status: InspectionStatus;
  location: string;
}

export interface LiDARPoint {
  x: number;
  y: number;
  z: number;
  intensity?: number;
}

export interface LiDARDataSummary {
  crackDepthMm: number;
  crackWidthMm: number;
  crackLengthMm: number;
  points: LiDARPoint[];
}

export interface CrackItem {
  id: string;
  crackName: string; // 균열 이름 (예: crack_001, crack_002)
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  imageUrl: string;
  segmentedUrl: string;
  position?: { x: number; y: number; z?: number };
  lidar: LiDARDataSummary;
  lidarJsonUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'; // 균열 상태 (ACTIVE=미확인, INACTIVE=확인됨)
}

export interface ReportDetail {
  id: string;
  sessionId: string;
  inspectionName: string;
  date: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  media: { videoUrl: string; images: string[]; modelingUrl?: string; detectionUrl?: string };
  cracks: CrackItem[];
  description?: string; // 전역 메모
  locationArea?: string; // 예: 성남시분당구
}