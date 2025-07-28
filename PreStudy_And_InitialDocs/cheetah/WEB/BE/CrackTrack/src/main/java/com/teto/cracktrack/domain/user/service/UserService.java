package com.teto.cracktrack.domain.user.service;

import com.teto.cracktrack.domain.user.dto.UpdateUserDto;
import com.teto.cracktrack.domain.user.dto.UserRequestDto;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;

public interface UserService {

  UserResponseDto findByUserId(Long userId);

  UserResponseDto insertUser(UserRequestDto userRequestDto);

  UserResponseDto updateUser(UpdateUserDto updateUserDto);
}
