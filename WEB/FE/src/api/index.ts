import type { Inspection, ReportDetail, CrackItem, LiDARDataSummary, InspectionStatus } from './types';
export type { InspectionStatus, Inspection, CrackItem, LiDARDataSummary, ReportDetail };

import { listInspections, getInspectionReport, createInspectionByLocation } from './tasks';
import { addPendingInspection } from '../utils/pending';
import { registerLocation } from './locations';

export interface LiveEventItem {
  timestamp: string;
  type: 'CRACK_DETECTED' | 'DRONE_STATUS' | 'SYSTEM';
  message: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getInspections(): Promise<Inspection[]> {
  return listInspections();
}

export async function getReportById(id: string): Promise<ReportDetail> {
  const date = new Date().toISOString();
  return getInspectionReport(id, date);
}

export async function getLiveEventsBySessionId(_sessionId: string): Promise<LiveEventItem[]> {
  // 실서버 엔드포인트 미정: 일단 빈 배열 반환
  return [];
}

export async function getLiveStreamUrl(_sessionId: string): Promise<string> {
  // 실서버 스트림 URL 미정: 빈 문자열 반환하여 UI에서 로딩 메시지 표시
  return '';
}

export async function createNewInspection(name: string): Promise<{ id: string; sessionId: string }> {
  const loc = await registerLocation(name);
  const created = await createInspectionByLocation(loc.locationId);
  return created;
}


