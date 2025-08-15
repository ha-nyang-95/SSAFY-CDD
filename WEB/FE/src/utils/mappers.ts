import type {
  CrackItem,
  CrackResponseDto,
  Inspection,
  InspectionStatus,
  TaskDetailResponseDto,
  TaskResponseDto,
} from '../api/types';
import { deriveSiblingLidarJsonUrl, isJsonUrl } from './openExternal';

export function mapTaskToInspection(dto: TaskResponseDto): Inspection {
  const id = String(dto.taskId);
  const full = dto.locationName;
  const guIndex = full.lastIndexOf('구');
  const location = guIndex >= 0 ? full.substring(0, guIndex + 1) : full; // 지역은 '구'까지만 표기
  // '...구' 기준으로 나눠 점검명은 '구 이후 문자열 + 점검'
  const name = guIndex >= 0 ? `${full.substring(guIndex + 1)} 점검` : `${full} 점검`;
  const date = dto.createdAt;
  // 백엔드 상태 매핑 (ACTIVE → LIVE, INACTIVE → COMPLETED)
  const status: InspectionStatus = dto.status === 'ACTIVE' ? 'LIVE' : 'COMPLETED';
  // 세션ID는 서버 목록 응답에 없으므로 임시 규칙(TASK-<id>)
  const sessionId = `TASK-${id}`;
  return { id, name, sessionId, date, status, location };
}

export function deriveInspectionStatusFromDetail(detail: TaskDetailResponseDto): InspectionStatus {
  const hasArtifacts = Boolean(detail.videoURL || detail.detectionURL || detail.modelingURL);
  return hasArtifacts ? 'COMPLETED' : 'LIVE';
}

// crackName을 깔끔한 ID로 변환 (예: crack_001 → 1, crack_002 → 2)
export function formatCrackId(crackName: string): string {
  // crack_001 형태에서 숫자 부분만 추출
  const match = crackName.match(/crack_(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num.toString(); // 앞의 0 제거 (001 → 1)
  }
  // 매치되지 않으면 원본 반환
  return crackName;
}

export function mapCrackDtoToCrackItem(dto: CrackResponseDto, detectionURL?: string): CrackItem {
  const severity: CrackItem['severity'] = dto.status === 'ACTIVE' ? 'HIGH' : 'LOW';
  // 서버가 필드명을 바르게 주지 못하는 경우(예: imageS3Url에 json, lidarS3Url에 jpg) 확장자로 판별하여 안전하게 매핑
  const isImg = (u?: string | null): boolean => typeof u === 'string' && /\.(png|jpg|jpeg|gif|webp)(\?|$)/i.test(u);

  // 우선순위: 명시적으로 맞는 타입의 URL, 없으면 다른 필드, 최종적으로 detectionURL/placeholder
  const resolvedImageUrl =
    (isImg(dto.imageS3Url) ? dto.imageS3Url : undefined) ??
    (isImg(dto.lidarS3Url) ? dto.lidarS3Url : undefined) ??
    detectionURL ?? '/assets/images/placeholder_detection.jpg';

  const resolvedSegmentUrl = dto.segmentS3Url ?? detectionURL ?? '/assets/images/placeholder_segmented.png';

  const resolvedLidarJsonUrl =
    (isJsonUrl(dto.lidarS3Url) ? dto.lidarS3Url : undefined) ??
    (isJsonUrl(dto.imageS3Url) ? dto.imageS3Url : undefined) ??
    deriveSiblingLidarJsonUrl(dto.segmentS3Url ?? dto.imageS3Url ?? undefined) ??
    undefined;
  return {
    id: String(dto.crackId),
    crackName: dto.crackName, // 균열 이름 추가
    label: `균열 ${formatCrackId(dto.crackName)}`, // 변환된 ID 사용
    severity,
    // 위에서 안전하게 분류된 URL 사용
    imageUrl: resolvedImageUrl,
    segmentedUrl: resolvedSegmentUrl,
    lidar: {
      crackDepthMm: 0,
      crackWidthMm: 0,
      crackLengthMm: 0,
      points: [],
    },
    lidarJsonUrl: resolvedLidarJsonUrl,
    status: dto.status, // 서버 상태 그대로 사용
  };
}

export function mapTaskDetailToReportDetail(
  dto: TaskDetailResponseDto,
  fallbackDateISO: string,
): import('../api/types').ReportDetail {
  // 한국어 주석: '...구...' 기준으로 분리 → 지역='...구', 지명='구 이후 문자열'
  const full = dto.locationName || '';
  const guIndex = full.lastIndexOf('구');
  let area = '';
  let bridgeName = full;
  if (guIndex >= 0) {
    area = full.substring(0, guIndex + 1).trim(); // 예: '성남시분당구'
    bridgeName = full.substring(guIndex + 1).trim() || full; // 예: '정자교'
  }

  const cracks = (dto.cracks ?? []).map((c) => mapCrackDtoToCrackItem(c, dto.detectionURL ?? undefined));
  // detectionURL(비디오 썸네일 개념)이 아니라 개별 crack 이미지들이 따로 오므로, 갤러리엔 imageS3Url/segmentS3Url를 합쳐 넣음
  const imageCandidates = (dto.cracks ?? [])
    .flatMap((c) => [c.imageS3Url, c.segmentS3Url])
    .filter((u): u is string => !!u);
  const images: string[] = imageCandidates.length > 0 ? imageCandidates : (dto.detectionURL ? [dto.detectionURL] : []);
  const videoUrl = dto.videoURL ?? '';
  const modelingUrl = dto.modelingURL ?? undefined;
  const detectionUrl = dto.detectionURL ?? undefined;
  return {
    id: String(dto.taskId),
    sessionId: `TASK-${dto.taskId}`,
    inspectionName: `${bridgeName} 점검 보고서`,
    date: dto.activatedAt ?? fallbackDateISO,
    overallRisk: cracks.some((c) => c.severity === 'HIGH') ? 'HIGH' : 'MEDIUM',
    media: { videoUrl, images, modelingUrl, detectionUrl },
    cracks,
    description: dto.description ?? undefined,
    locationArea: area || undefined,
  };
}


