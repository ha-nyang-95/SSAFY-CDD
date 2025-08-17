package com.b102.cracktrack.domain.user.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.user.dto.PasswordChangeRequestDto;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.dto.UserUpdateRequestDto;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import com.b102.cracktrack.domain.user.service.UserService;
import com.b102.cracktrack.domain.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public UserResponseDto findByUserId(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(()->{
          log.warn("[UserService] 유저가 존재하지 않음, userId={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });
    log.info("[UserService] 유저 조회 성공, userId={}", userId);
    return UserResponseDto.from(user);
  }

  @Transactional
  @Override
  public UserResponseDto updateUser(Long userId, UserUpdateRequestDto request) {
    log.info("[UserService] 사용자 정보 수정 시도, userId={}, newName={}", userId, request.username());
    
    User user = userRepository.findById(userId)
        .orElseThrow(() -> {
          log.error("[UserService] 사용자 정보 수정 실패: 유저 없음, userId={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });
    
    // 이름 변경
    user.changeName(request.username());
    userRepository.save(user);
    
    log.info("[UserService] 사용자 정보 수정 성공, userId={}, newName={}", userId, request.username());
    return UserResponseDto.from(user);
  }

  @Transactional
  @Override
  public void changePassword(Long userId, PasswordChangeRequestDto request) {
    log.info("[UserService] 비밀번호 변경 시도, userId={}", userId);
    
    User user = userRepository.findById(userId)
        .orElseThrow(() -> {
          log.error("[UserService] 비밀번호 변경 실패: 유저 없음, userId={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });
    
    // 현재 비밀번호 확인
    if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
      log.warn("[UserService] 비밀번호 변경 실패: 현재 비밀번호 불일치, userId={}", userId);
      throw new ApiException(HttpStatus.BAD_REQUEST.value(), "현재 비밀번호가 올바르지 않습니다.");
    }
    
    // 새 비밀번호와 기존 비밀번호가 같은지 확인
    if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
      log.warn("[UserService] 비밀번호 변경 실패: 동일한 비밀번호, userId={}", userId);
      throw new ApiException(HttpStatus.BAD_REQUEST.value(), "새 비밀번호는 현재 비밀번호와 달라야 합니다.");
    }
    
    // 비밀번호 변경
    user.changePassword(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);
    
    log.info("[UserService] 비밀번호 변경 성공, userId={}", userId);
  }

  @Transactional
  @Override
  public void deleteCurrentUser(Long userId) {
    // 회원 탈퇴: 소프트 삭제 + 관련 리프레시 토큰 삭제 등 부수 처리 필요 시 확장
    User user = userRepository.findById(userId)
        .orElseThrow(() -> {
          log.error("[UserService] 회원 탈퇴 실패: 유저 없음, userId={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });

    // 소프트 삭제 처리
    user.softDelete(); // BaseEntity의 softDelete() 사용
    userRepository.save(user);

    // 로그인 유지 방지를 위해 refresh token 제거
    try {
      refreshTokenRepository.deleteByUserId(userId);
      log.info("[UserService] 회원 탈퇴: Refresh Token 삭제 완료, userId={}", userId);
    } catch (Exception e) {
      log.warn("[UserService] 회원 탈퇴: Refresh Token 삭제 중 예외 발생, userId={}, error={}", userId, e.getMessage());
    }

    log.info("[UserService] 회원 탈퇴(소프트 삭제) 완료, userId={}", userId);
  }
}
