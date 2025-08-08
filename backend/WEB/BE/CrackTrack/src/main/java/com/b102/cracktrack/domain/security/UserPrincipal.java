package com.b102.cracktrack.domain.security;

import com.b102.cracktrack.domain.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Spring Security에서 사용하는 사용자 인증 정보
 * 컨트롤러에서 @AuthenticationPrincipal로 현재 사용자 정보 접근 가능
 */
@Getter
@RequiredArgsConstructor
public class UserPrincipal implements UserDetails {

  private final Long userId;
  private final String email;
  private final String name;
  private final String role;
  
  @JsonIgnore  // API 응답에서 비밀번호 제외
  private final String password;

  public static UserPrincipal from(User user) {
    return new UserPrincipal(
        user.getUserId(),
        user.getEmail(),
        user.getName(),
        user.getRole().name(),
        user.getPassword()
    );
  }

  @Override
  @JsonIgnore
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
  }

  @Override
  @JsonIgnore
  public String getPassword() {
    return password;
  }

  @Override
  @JsonIgnore
  public String getUsername() {
    return email; // 로그인 시 이메일을 username으로 사용
  }

  @Override
  @JsonIgnore
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  @JsonIgnore
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  @JsonIgnore
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  @JsonIgnore
  public boolean isEnabled() {
    return true;
  }

  /**
   * 현재 사용자가 특정 권한을 가지고 있는지 확인
   * hasrole로 대체가능
   */
  public boolean hasRole(String role) {
    return this.role.equals(role);
  }

  public boolean isAdmin() {
    return hasRole("ADMIN");
  }

  public boolean isGeneral() {
    return hasRole("GENERAL");
  }
} 