import { http } from './client';
import type { TaskResponseDto, TaskFirstResponseDto, TaskDetailResponseDto, CrackItem } from './types';
import type { Inspection, ReportDetail } from './types';
import { mapTaskToInspection, mapTaskDetailToReportDetail } from '../utils/mappers';
import { deriveSiblingLidarJsonUrl, isJsonUrl } from '../utils/openExternal';

// 목록 조회 → Inspection[] 변환
export async function listInspections(): Promise<Inspection[]> {
  // 한국어 주석: 서버 응답만 사용하여 목록을 구성합니다. (로컬 보류 항목 병합 제거)
  const tasks = await http.get<TaskResponseDto[]>('/api/tasks', true);
  return tasks.map(mapTaskToInspection);
}

// 지역 기준 목록 조회 (내 지역 작업)
export async function listInspectionsByDistrict(): Promise<Inspection[]> {
  const tasks = await http.get<TaskResponseDto[]>('/api/tasks/district', true);
  return tasks.map(mapTaskToInspection);
}

// 상세 조회 → ReportDetail 변환
export async function getInspectionReport(taskId: string, fallbackDateISO?: string): Promise<ReportDetail> {
  const detail = await http.get<TaskDetailResponseDto>(`/api/task/${encodeURIComponent(taskId)}`, true);
  const date = fallbackDateISO ?? new Date().toISOString();
  return mapTaskDetailToReportDetail(detail, date);
}

// 메모 저장
export async function saveCrackMemo(
  taskId: string,
  payload: { crackId: string; label: string; memo: string },
): Promise<void> {
  // 백엔드 스펙: 상세 조회는 /api/task/{id} 이므로 메모 저장도 단수형 경로를 우선 시도
  await http.put<unknown>(`/api/task/${encodeURIComponent(taskId)}`, payload, true);
}

// 생성 플로우: locationId는 외부에서 주입
export async function createInspectionByLocation(
  locationId: number,
  _addToPending: boolean = true,
): Promise<{ id: string; sessionId: string }> {
  const res = await http.post<TaskFirstResponseDto>(`/api/tasks/${encodeURIComponent(String(locationId))}`, undefined, true);
  const id = String(res.taskId);
  const sessionId = res.s3Name;
  // 한국어 주석: 로컬 보류 저장 로직 제거. 서버 목록만 사용합니다.
  return { id, sessionId };
}

// 지역 문자열(예: "대전광역시 유성구 온천교")로 세션 생성
export async function createInspectionByDistrict(regionFullName: string): Promise<{ id: string; sessionId: string }> {
  // 서버 스펙: application/json 본문에 순수 문자열을 전달
  const res = await http.post<TaskFirstResponseDto>(`/api/tasks/district`, regionFullName, true);
  return { id: String(res.taskId), sessionId: res.s3Name };
}

// 작업 이력 조회
export async function getTaskHistory(taskId: string): Promise<TaskResponseDto[]> {
  return http.get<TaskResponseDto[]>(`/api/task/district/${encodeURIComponent(taskId)}`, true);
}

// 이전 작업의 균열 정보 조회
export async function getPreviousTaskCracks(taskId: string): Promise<CrackItem[]> {
  try {
    const cracks = await http.get<any[]>(`/api/cracks/task/${encodeURIComponent(taskId)}`, true);
    return cracks.map(crack => ({
      id: String(crack.crackId || crack.id),
      label: `균열 ${crack.crackId || crack.id}`,
      severity: crack.status === 'ACTIVE' ? 'HIGH' : 'LOW',
      imageUrl: crack.imageS3Url || crack.imageUrl || '',
      segmentedUrl: crack.segmentS3Url || crack.segmentedUrl || '',
      position: undefined,
      lidar: {
        crackDepthMm: 0,
        crackWidthMm: 0,
        crackLengthMm: 0,
        points: [],
      },
      lidarJsonUrl: isJsonUrl(crack.lidarS3Url) ? crack.lidarS3Url
        : isJsonUrl(crack.imageS3Url) ? crack.imageS3Url
        : deriveSiblingLidarJsonUrl(crack.segmentS3Url || crack.imageS3Url || crack.imageUrl),
      status: crack.status,
    }));
  } catch (error) {
    console.error('이전 작업 균열 정보 조회 실패:', error);
    return [];
  }
}


