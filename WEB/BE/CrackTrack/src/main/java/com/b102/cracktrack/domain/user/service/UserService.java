package com.b102.cracktrack.domain.user.service;

import com.b102.cracktrack.domain.user.dto.PasswordChangeRequestDto;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.dto.UserUpdateRequestDto;

public interface UserService {
  UserResponseDto findByUserId(Long userId);
  
  UserResponseDto updateUser(Long userId, UserUpdateRequestDto request);
  
  void changePassword(Long userId, PasswordChangeRequestDto request);

  // 회원 탈퇴 처리 (소프트 삭제)
  void deleteCurrentUser(Long userId);
}
