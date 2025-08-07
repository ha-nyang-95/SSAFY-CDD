package com.b102.cracktrack.domain.user.service;


import com.b102.cracktrack.domain.user.dto.UserResponseDto;

public interface UserService {
  UserResponseDto findByUserId(Long userId);
}
