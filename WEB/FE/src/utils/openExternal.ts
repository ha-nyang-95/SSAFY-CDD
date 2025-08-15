// 외부(S3 등) URL을 새 탭으로 안전하게 여는 헬퍼
export function openExternalUrl(url: string): void {
  try {
    const trimmed = (url ?? '').trim();
    if (!trimmed) return;
    const isHttp = /^https?:\/\//i.test(trimmed);
    const finalUrl = isHttp ? trimmed : encodeURI(trimmed);
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  } catch {
    // 무시: 브라우저 팝업 차단 등 사용자가 허용해야 열림
  }
}

// 퍼블릭 S3(또는 CDN) 리소스를 쿠키 없이 가져오는 헬퍼
export async function fetchPublicJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`요청 실패: ${res.status}`);
  return (await res.json()) as T;
}

// 퍼블릭 이미지를 받아 브라우저 Blob URL로 변환
export async function fetchPublicBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// URL이 JSON(lidar.json 등)인지 판별
export function isJsonUrl(url?: string | null): boolean {
  return typeof url === 'string' && /\.json(\?|$)/i.test(url);
}

// 주어진 미디어(이미지/세그먼트) URL과 같은 폴더의 lidar.json 경로를 유도
export function deriveSiblingLidarJsonUrl(url?: string | null): string | undefined {
  try {
    if (!url) return undefined;
    try {
      const obj = new URL(url);
      const parts = obj.pathname.split('/');
      parts.pop();
      obj.pathname = `${parts.join('/')}/lidar.json`;
      obj.search = '';
      return obj.toString();
    } catch {
      const lastSlash = url.lastIndexOf('/');
      if (lastSlash >= 0) return `${url.slice(0, lastSlash)}/lidar.json`;
      return undefined;
    }
  } catch {
    return undefined;
  }
}


