import { http } from './client';
import type { CrackResponseDto } from './types';

export async function listCracksByTask(taskId: number): Promise<CrackResponseDto[]> {
  return http.get<CrackResponseDto[]>(`/api/cracks/task/${encodeURIComponent(String(taskId))}`, true);
}

export async function getCrack(crackId: number): Promise<CrackResponseDto> {
  return http.get<CrackResponseDto>(`/api/cracks/${encodeURIComponent(String(crackId))}`, true);
}

export async function markCrack(crackId: number): Promise<CrackResponseDto> {
  return http.put<CrackResponseDto>(`/api/cracks/${encodeURIComponent(String(crackId))}`, undefined, true);
}

export async function deleteCrack(crackId: number): Promise<void> {
  await http.delete<null>(`/api/cracks/${encodeURIComponent(String(crackId))}`, true);
}


