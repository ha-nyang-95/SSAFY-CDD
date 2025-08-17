import { http } from './client';

export type LocationResponseDto = {
  locationId: number;
  name: string;
};

export async function listLocations(): Promise<LocationResponseDto[]> {
  // 명세에 따르면 /api/location/list 는 data에 { locations: Location[] } 형태를 반환합니다.
  const res = await http.get<unknown>('/api/location/list', true);
  // 서버가 { locations: [...] } 또는 직접 배열을 반환할 가능성을 모두 처리합니다.
  if (Array.isArray(res)) {
    return res as LocationResponseDto[];
  }
  const obj = res as { locations?: LocationResponseDto[] };
  return obj.locations ?? [];
}

export async function registerLocation(name: string): Promise<LocationResponseDto> {
  // 명세에 따라 등록은 POST /api/location/register 입니다.
  // 서버 응답의 key가 환경에 따라 LocationId / locationId 등으로 달라질 수 있어 안전하게 정규화합니다.
  const raw = await http.post<unknown>('/api/location/register', { name }, true);
  const obj = raw as any;
  const idCandidate = obj?.locationId ?? obj?.LocationId ?? obj?.id ?? obj?.locationID;
  return {
    locationId: Number(idCandidate),
    name: String(obj?.name ?? obj?.locationName ?? name),
  } as LocationResponseDto;
}

export async function removeLocation(locationId: number): Promise<void> {
  // 명세에 따라 삭제는 DELETE /api/location/remove/{locationId} 입니다.
  await http.delete<null>(`/api/location/remove/${encodeURIComponent(String(locationId))}`, true);
}


