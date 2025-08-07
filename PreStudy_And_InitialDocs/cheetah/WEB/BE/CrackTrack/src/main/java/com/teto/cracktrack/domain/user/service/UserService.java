package com.teto.cracktrack.domain.user.service;

import com.teto.cracktrack.domain.user.dto.UserResponseDto;

public interface UserService {
  UserResponseDto findByUserId(Long userId);
}
