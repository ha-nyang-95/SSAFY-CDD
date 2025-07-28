package com.teto.cracktrack.domain.user.service.impl;

import com.teto.cracktrack.domain.user.dto.UpdateUserDto;
import com.teto.cracktrack.domain.user.dto.UserRequestDto;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;
import com.teto.cracktrack.domain.user.entity.User;
import com.teto.cracktrack.domain.user.entity.User.Role;
import com.teto.cracktrack.domain.user.repository.UserRepository;
import com.teto.cracktrack.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;

  @Override
  public UserResponseDto findByUserId(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(()->{
          log.warn("[Service]유저가 존재하지 않음, userId={}",userId);
          return new IllegalArgumentException("유저를 찾을 수 없습니다.");
        });
    log.info("[Service]유저 조회 성공, userId={}",userId);
    return UserResponseDto.of(user);
  }

  @Override
  public UserResponseDto insertUser(UserRequestDto userRequestDto) {
    log.info("[Service] 회원가입 시도, email={}", userRequestDto.email());
    User u =UserRequestDto.from(userRequestDto);
    u.setActive();
    u.changeRole(Role.GENERAL);
    User save =  userRepository.save(u);
    log.info("[Service] 회원가입 완료, userId={}, email={}", save.getUserId(), save.getEmail());
    return UserResponseDto.of(save);
  }

  @Override
  public UserResponseDto updateUser(UpdateUserDto updateUserDto) {

    return null;
  }
}
