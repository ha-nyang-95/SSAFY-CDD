package com.b102.cracktrack.domain.auth.service;


import com.b102.cracktrack.domain.auth.dto.LoginRequestDto;
import com.b102.cracktrack.domain.auth.dto.SignUpRequestDto;
import com.b102.cracktrack.domain.auth.dto.TokenResponseDto;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;

public interface AuthService {

  /**
   * 회원가입
   */
  UserResponseDto signUp(SignUpRequestDto signUpRequestDto);

  /**
   * 로그인
   */
  TokenResponseDto login(LoginRequestDto loginRequest);

  /**
   * 토큰 재발급
   */
  TokenResponseDto refreshToken(String refreshToken);

  /**
   * 로그아웃 - Refresh Token DB에서 삭제
   */
  void logout(Long userId);

  /**
   * 이메일 사용 가능 여부 확인
   */
  boolean isEmailAvailable(String email);
}
