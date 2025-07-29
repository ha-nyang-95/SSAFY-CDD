package com.b102.cracktrack.domain.user.service.impl;

import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import com.b102.cracktrack.domain.user.service.UserService;
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
}
