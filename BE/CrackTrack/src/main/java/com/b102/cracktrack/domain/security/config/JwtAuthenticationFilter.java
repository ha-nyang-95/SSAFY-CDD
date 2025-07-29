package com.b102.cracktrack.domain.security.config;

import com.b102.cracktrack.common.util.CookieUtil;
import com.b102.cracktrack.domain.auth.jwt.JwtTokenProvider;
import com.b102.cracktrack.domain.auth.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider jwtTokenProvider;
  private final CustomUserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
    
    String accessToken = getAccessTokenFromRequest(request);

    // Access Token이 유효한 경우만 인증 처리
    if (StringUtils.hasText(accessToken) && jwtTokenProvider.validateToken(accessToken)) {
      authenticateWithToken(request, accessToken);
    }
    // refresh Token 기반 재발급 로직은 없음 필요시 추가 예정
    filterChain.doFilter(request, response);
  }

  private void authenticateWithToken(HttpServletRequest request, String token) {
    try {
      String email = jwtTokenProvider.getEmailFromToken(token);
      
      UserDetails userDetails = userDetailsService.loadUserByUsername(email);
      UsernamePasswordAuthenticationToken authentication = 
          new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      
      SecurityContextHolder.getContext().setAuthentication(authentication);
      log.debug("[JWT Filter] 인증 성공: {}", email);
    } catch (Exception e) {
      log.warn("[JWT Filter] 인증 실패: {}", e.getMessage());
    }
  }

  private String getAccessTokenFromRequest(HttpServletRequest request) {
    // 1. Authorization 헤더에서 Bearer 토큰 확인
    String bearerToken = request.getHeader("Authorization");
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    // 2. 쿠키에서 accessToken 확인
    String cookieToken = CookieUtil.getCookieValue(request, "accessToken");
    if (StringUtils.hasText(cookieToken)) {
      return cookieToken;
    }
    
    return null;
  }

  // 프론트 단에서 재발급 엔드포인트로 접근하는 것으로 해결
//   private String getRefreshTokenFromRequest(HttpServletRequest request) {
//    String refreshToken = CookieUtil.getCookieValue(request, "refreshToken");
//    if(StringUtils.hasText(refreshToken) && refreshToken.startsWith(refreshToken)) {
//      return refreshToken;
//    }
//     return null;
//   }
}
