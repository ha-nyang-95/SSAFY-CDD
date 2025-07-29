package com.teto.cracktrack.domain.auth.controller;

import com.teto.cracktrack.common.util.ApiResult;
import com.teto.cracktrack.common.util.CookieUtil;
import com.teto.cracktrack.domain.auth.dto.LoginRequestDto;
import com.teto.cracktrack.domain.auth.dto.SignUpRequestDto;
import com.teto.cracktrack.domain.auth.dto.TokenResponseDto;
import com.teto.cracktrack.domain.security.UserPrincipal;
import com.teto.cracktrack.domain.auth.service.AuthService;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증", description = "인증 관련 API")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final AuthService authService;

  @Operation(summary = "회원 가입", description = "새로운 사용자를 등록합니다.")
  @PostMapping("/signUp")
  public ApiResult<UserResponseDto> signUp(@Valid @RequestBody SignUpRequestDto signUpRequestDto) {
    log.info("[AuthController] 회원가입 요청: {}", signUpRequestDto.email());
    UserResponseDto signUpUser = authService.signUp(signUpRequestDto);
    log.info("[AuthController] 회원가입 완료: {}", signUpRequestDto.email());
    return ApiResult.success(signUpUser);
  }

  @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 토큰을 쿠키에 저장합니다.")
  @PostMapping("/login")
  public ResponseEntity<ApiResult<TokenResponseDto>> login(@Valid @RequestBody LoginRequestDto loginRequest) {
    log.info("[AuthController] 로그인 요청: {}", loginRequest.email());
    TokenResponseDto tokenResponse = authService.login(loginRequest);
    HttpHeaders headers = CookieUtil.createCookie(tokenResponse.accessToken(), tokenResponse.refreshToken());
    log.info("[AuthController] 로그인 성공: {}", loginRequest.email());
    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(tokenResponse));
  }

  @Operation(summary = "토큰 재발급", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
  @PostMapping("/refresh")
  public ResponseEntity<ApiResult<TokenResponseDto>> refresh(HttpServletRequest request) {
    log.info("[AuthController] 토큰 재발급 요청");
    String refreshToken = CookieUtil.getCookieValue(request, "refreshToken");
    if (refreshToken == null) {
      log.warn("[AuthController] 리프레시 토큰이 없음");
      return ResponseEntity.badRequest()
          .body(ApiResult.fail(400, "리프레시 토큰이 없습니다."));
    }
    
    TokenResponseDto tokenResponse = authService.refreshToken(refreshToken);
    HttpHeaders headers = CookieUtil.createCookie(tokenResponse.accessToken(), tokenResponse.refreshToken());
    
    log.info("[AuthController] 토큰 재발급 성공");
    
    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(tokenResponse));
  }

  @Operation(summary = "로그아웃", description = "로그아웃하고 쿠키를 삭제합니다.")
  @PostMapping("/logout")
  public ResponseEntity<ApiResult<Void>> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    log.info("[AuthController] 로그아웃 요청 - userId: {}, email: {}", 
        userPrincipal.getUserId(), userPrincipal.getEmail());

    HttpHeaders headers = CookieUtil.cleanCookies();
    
    log.info("[AuthController] 로그아웃 성공 - userId: {}", userPrincipal.getUserId());
    
    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(null));
  }
}
