package com.teto.cracktrack.domain.auth.service;

import com.teto.cracktrack.domain.auth.dto.LoginRequestDto;
import com.teto.cracktrack.domain.auth.dto.SignUpRequestDto;
import com.teto.cracktrack.domain.auth.dto.TokenResponseDto;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;

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
}
