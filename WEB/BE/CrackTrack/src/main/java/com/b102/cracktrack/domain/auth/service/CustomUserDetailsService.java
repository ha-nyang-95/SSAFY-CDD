package com.b102.cracktrack.domain.auth.service;

import com.b102.cracktrack.domain.security.UserPrincipal;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

    @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    log.info("[UserDetailsService] 사용자 인증 정보 조회 시도: {}", email);

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> {
          log.warn("[UserDetailsService] 사용자를 찾을 수 없음: {}", email);
          return new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
        });

    log.info("[UserDetailsService] 사용자 인증 정보 조회 성공: {}", email);

    return UserPrincipal.from(user);
  }
} 