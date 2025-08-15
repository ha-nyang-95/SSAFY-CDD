import type { ApiResult } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const PROXY_TARGET = import.meta.env.VITE_API_PROXY_TARGET as string | undefined;

// 한국어 주석: 레거시(이전 버전)에서 남아 있을 수 있는 로컬스토리지 토큰을 초기 로드 시 제거합니다.
(() => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  } catch {
    // ignore
  }
})();

export function getBaseUrl(): string {
  // In dev with proxy target, use relative path to hit Vite proxy
  if (import.meta.env.DEV && PROXY_TARGET) return '';
  return BASE_URL ?? '';
}

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  auth?: boolean;
};

// 한국어 주석: 쿠키 기반 인증으로 전환하여 로컬스토리지 토큰 관리를 제거합니다.
function getAccessToken(): string | null { return null; }
function getRefreshToken(): string | null { return null; }
function setTokens(): void { /* no-op */ }

async function refreshTokensOnce(): Promise<boolean> {
  // 한국어 주석: 쿠키 기반이므로 바디 없이 쿠키만 전송하여 리프레시 시도
  try {
    const res = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    // 일부 서버는 204(No Content)로 응답할 수 있음 → ok만 체크
    if (res.ok) {
      // JSON이 아닌 응답일 수도 있으므로 안전하게 처리
      try {
        const json = (await res.json()) as ApiResult<any>;
        if (json && json.success === true) return true;
      } catch {
        // 바디가 없는 경우에도 ok면 성공으로 판단
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const url = `${getBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  const init: RequestInit = {
    method,
    headers,
    // 한국어 주석: 쿠키 기반 인증을 위해 항상 credentials를 포함합니다.
    credentials: 'include',
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  // 한국어 주석: 사용자에게 서버의 원본 에러 메시지를 노출하지 않도록 상태코드 기반의 일반화된 문구로 매핑합니다.
  const getFriendlyMessage = (status: number | undefined): string => {
    if (!status) return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
    if (status === 400) return '요청 형식이 올바르지 않습니다. 입력값을 다시 확인해 주세요.';
    if (status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
    if (status === 403) return '이 작업을 수행할 권한이 없습니다.';
    if (status === 404) return '요청하신 정보를 찾을 수 없습니다.';
    if (status === 409) return '이미 처리된 요청입니다. 화면을 새로고침 후 다시 시도해 주세요.';
    if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    if (status >= 500 && status <= 599) return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  };

  // 한국어 주석: 네트워크 오류를 포착하여 사용자에게는 일반화된 메시지를 제공하고, 상세는 콘솔에만 남깁니다.
  const safeFetch = async (fetchUrl: string, fetchInit: RequestInit): Promise<Response> => {
    try {
      return await fetch(fetchUrl, fetchInit);
    } catch (unknownError) {
      console.error('[HTTP] 네트워크 오류', { url: fetchUrl, method: fetchInit.method, error: unknownError });
      throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 상태를 확인 후 다시 시도해 주세요.');
    }
  };

  
  let res = await safeFetch(url, init);
  let retried = false;

  // 상태 코드 기반 만료 처리 (401/419/440 등)
  if (options.auth && (res.status === 401 || res.status === 419 || res.status === 440)) {
    const refreshed = await refreshTokensOnce();
    if (refreshed) {
      retried = true;
      res = await safeFetch(url, init);
    } else {
      setTokens('', '');
      try { window.location.assign('/login'); } catch {}
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }
  }

  // 본문 파싱 시 JSON이 아닐 수 있음 → 안전 처리
  let json: ApiResult<T> | null = null;
  try {
    json = (await res.json()) as ApiResult<T>;
  } catch {
    // JSON이 아닌데 성공 상태면 통과, 아니면 에러
    if (!res.ok) throw new Error(getFriendlyMessage(res.status));
    // ok이면서 바디 없음 → null 반환을 허용하지 않도록 기본 형태로 채움
    json = { success: true, code: res.status, message: 'ok', data: null } as unknown as ApiResult<T>;
  }

  // 본문 내 코드 기반 만료 처리 (서버가 200 + code=401로 응답하는 경우)
  if (
    options.auth && !retried && json && json.success === false &&
    (json.code === 401 || json.code === 419)
  ) {
    const refreshed = await refreshTokensOnce();
    if (refreshed) {
      res = await safeFetch(url, init);
      try {
        json = (await res.json()) as ApiResult<T>;
      } catch {
        if (!res.ok) throw new Error(getFriendlyMessage(res.status));
        json = { success: true, code: res.status, message: 'ok', data: null } as unknown as ApiResult<T>;
      }
    } else {
      setTokens('', '');
      try { window.location.assign('/login'); } catch {}
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }
  }

  if (!json || json.success !== true) {
    // 한국어 주석: 서버 상세 메시지 노출 방지. 상세는 콘솔에 기록
    const serverMessage = json?.message;
    const effectiveStatus = res.ok ? (json?.code ?? res.status) : res.status;
    if (serverMessage) {
      console.error('[HTTP] 서버 응답 에러', { url, method, status: effectiveStatus, serverMessage });
    }
    throw new Error(getFriendlyMessage(effectiveStatus));
  }
  return json.data as T;
}

export const http = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: 'GET', auth }),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body?: unknown, auth = true) => request<T>(path, { method: 'PUT', body, auth }),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: 'DELETE', auth }),
};

export const tokenStore = { set: setTokens, getAccess: getAccessToken, getRefresh: getRefreshToken };

export type { ApiResult };


