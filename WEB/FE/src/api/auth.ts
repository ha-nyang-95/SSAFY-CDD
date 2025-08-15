import { http } from './client';
import type { LoginRequestDto, SignUpRequestDto, UserResponseDto } from './types';

// 쿠키 기반 인증으로 로그인/리프레시/로그아웃 시 토큰을 저장하지 않습니다.
export async function login(payload: LoginRequestDto): Promise<UserResponseDto> {
  // 서버가 Set-Cookie로 토큰을 내려주며, 바디에는 사용자 정보를 반환한다고 가정
  const me = await http.post<UserResponseDto>('/api/auth/login', payload, false);
  return me;
}

export async function logout(): Promise<void> {
  await http.post<null>('/api/auth/logout', undefined, true);
}

export async function signUp(payload: SignUpRequestDto): Promise<UserResponseDto> {
  return http.post<UserResponseDto>('/api/auth/signUp', payload, false);
}

export async function checkEmail(email: string): Promise<boolean> {
  return http.get<boolean>(`/api/auth/check-email?email=${encodeURIComponent(email)}`, false);
}

export async function me(): Promise<UserResponseDto> {
  // /api/user/me 는 UserPrincipal이나 UserResponseDto와 유사 구조를 반환
  return http.get<UserResponseDto>('/api/user/me', true);
}


