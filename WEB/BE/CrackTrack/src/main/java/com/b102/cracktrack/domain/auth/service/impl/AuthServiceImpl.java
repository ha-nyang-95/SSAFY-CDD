package com.b102.cracktrack.domain.auth.service.impl;

import com.b102.cracktrack.domain.auth.dto.LoginRequestDto;
import com.b102.cracktrack.domain.auth.dto.SignUpRequestDto;
import com.b102.cracktrack.domain.auth.dto.TokenResponseDto;
import com.b102.cracktrack.domain.auth.entity.RefreshToken;
import com.b102.cracktrack.domain.auth.jwt.JwtTokenProvider;
import com.b102.cracktrack.domain.auth.repository.RefreshTokenRepository;
import com.b102.cracktrack.domain.auth.service.AuthService;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final JwtTokenProvider jwtTokenProvider;
  private final AuthenticationManager authenticationManager;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  @Override
  public UserResponseDto signUp(SignUpRequestDto signUpRequestDto) {
    log.info("[AuthService] 회원가입 시도, email={}", signUpRequestDto.email());

    // 이메일 중복 체크
    if (userRepository.existsByEmail(signUpRequestDto.email())) {
      log.warn("[AuthService] 이미 존재하는 이메일: {}", signUpRequestDto.email());
      throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
    }

    User user = SignUpRequestDto.of(signUpRequestDto);

    // 비밀번호 암호화
    user.changePassword(passwordEncoder.encode(user.getPassword()));
    user.changeRole(User.Role.GENERAL);

    User savedUser = userRepository.save(user);
    log.info("[AuthService] 회원가입 완료, userId={}, email={}", savedUser.getUserId(),
        savedUser.getEmail());

    return UserResponseDto.from(savedUser);
  }

  @Transactional
  @Override
  public TokenResponseDto login(LoginRequestDto loginRequest) {
    log.info("[AuthService] 로그인 시도: {}", loginRequest.email());

    try {
      // Spring Security 인증
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
      );

      // 사용자 정보 조회
      User user = userRepository.findByEmail(loginRequest.email())
          .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

      // JWT 토큰 생성
      String accessToken = jwtTokenProvider.createAccessToken(user.getEmail(),
          user.getRole().name());
      String refreshToken = jwtTokenProvider.createRefreshToken(user.getEmail(),
          user.getRole().name());

      // 리프레시 토큰 저장 또는 업데이트
      refreshTokenRepository.findByUserId(user.getUserId()).ifPresentOrElse(
          existingToken -> {
            existingToken.updateToken(refreshToken);
            refreshTokenRepository.save(existingToken);
          },
          () -> {
            RefreshToken newRefreshToken = RefreshToken.builder()
                .userId(user.getUserId())
                .refreshToken(refreshToken)
                .build();
            refreshTokenRepository.save(newRefreshToken);
          }
      );

      log.info("[AuthService] 로그인 성공: {}", loginRequest.email());

      return new TokenResponseDto(
          user.getUserId(),
          user.getEmail(),
          user.getName(),
          user.getRole().name(),
          accessToken,
          refreshToken

      );

    } catch (AuthenticationException e) {
      log.warn("[AuthService] 로그인 실패: {} - {}", loginRequest.email(), e.getMessage());
      throw new RuntimeException("이메일 또는 비밀번호가 잘못되었습니다.");
    }
  }

  @Override
  public TokenResponseDto refreshToken(String refreshToken) {
    log.info("[AuthService] 토큰 재발급 시도");

    if (!jwtTokenProvider.validateToken(refreshToken)) {
      throw new RuntimeException("유효하지 않은 리프레시 토큰입니다.");
    }

    String email = jwtTokenProvider.getEmailFromToken(refreshToken);
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    // DB의 리프레시 토큰과 비교
    RefreshToken storedToken = refreshTokenRepository.findByUserId(user.getUserId())
        .orElseThrow(() -> new RuntimeException("리프레시 토큰을 찾을 수 없습니다."));

    if (!storedToken.getRefreshToken().equals(refreshToken)) {
      throw new RuntimeException("일치하지 않는 리프레시 토큰입니다.");
    }

    String newAccessToken = jwtTokenProvider.createAccessToken(user.getEmail(),
        user.getRole().name());
    String newRefreshToken = jwtTokenProvider.createRefreshToken(user.getEmail(),
        user.getRole().name());

    // 새로운 리프레시 토큰으로 업데이트
    storedToken.updateToken(newRefreshToken);
    refreshTokenRepository.save(storedToken);

    log.info("[AuthService] 토큰 재발급 성공: {}", email);

    return new TokenResponseDto(
        user.getUserId(),
        user.getEmail(),
        user.getName(),
        user.getRole().name(),
        newAccessToken,
        newRefreshToken
    );
  }

  @Transactional
  @Override
  public void logout(Long userId) {
    log.info("[AuthService] 로그아웃 시도: userId={}", userId);

    // 리프레시 토큰 삭제
    refreshTokenRepository.deleteByUserId(userId);
    
    log.info("[AuthService] 로그아웃 완료: userId={}", userId);
  }
} 