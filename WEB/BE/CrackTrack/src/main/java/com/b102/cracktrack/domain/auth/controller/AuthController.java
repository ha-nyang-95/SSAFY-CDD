package com.b102.cracktrack.domain.auth.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.common.util.CookieUtil;
import com.b102.cracktrack.domain.auth.dto.LoginRequestDto;
import com.b102.cracktrack.domain.auth.dto.SignUpRequestDto;
import com.b102.cracktrack.domain.auth.dto.TokenResponseDto;
import com.b102.cracktrack.domain.auth.service.AuthService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
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
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

  private final AuthService authService;

  @Operation(summary = "회원 가입", description = "새로운 사용자를 등록합니다.")
  @PostMapping("/signUp")
  public ResponseEntity<ApiResult<UserResponseDto>> signUp(@Valid @RequestBody SignUpRequestDto signUpRequestDto) {

    UserResponseDto signUpUser = authService.signUp(signUpRequestDto);

    return ResponseEntity.ok()
        .body(ApiResult.success(signUpUser));
  }

  @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 토큰을 쿠키에 저장합니다.")
  @PostMapping("/login")
  public ResponseEntity<ApiResult<TokenResponseDto>> login(@Valid @RequestBody LoginRequestDto loginRequest) {

    TokenResponseDto tokenResponse = authService.login(loginRequest);
    HttpHeaders headers = CookieUtil.createCookie(tokenResponse.accessToken(), tokenResponse.refreshToken());

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(tokenResponse));
  }

  @Operation(summary = "토큰 재발급", description = "리프레시 토큰으로 새로운 액세스 토큰을 발급받습니다.")
  @PostMapping("/refresh")
  public ResponseEntity<ApiResult<TokenResponseDto>> refresh(HttpServletRequest request) {

    String refreshToken = CookieUtil.getCookieValue(request, "refreshToken");
    if (refreshToken == null) {
      return ResponseEntity.badRequest()
          .body(ApiResult.fail(400, "리프레시 토큰이 없습니다."));
    }
    
    TokenResponseDto tokenResponse = authService.refreshToken(refreshToken);
    HttpHeaders headers = CookieUtil.createCookie(tokenResponse.accessToken(), tokenResponse.refreshToken());

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(tokenResponse));
  }

  @Operation(summary = "로그아웃", description = "로그아웃하고 쿠키를 삭제하고 리프레시 토큰을 데이터베이스에서 삭제합니다.")
  @PostMapping("/logout")
  public ResponseEntity<ApiResult<Void>> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {

    // 리프레시 토큰을 데이터베이스에서 삭제
    authService.logout(userPrincipal.getId());

    // 쿠키 삭제
    HttpHeaders headers = CookieUtil.cleanCookies();

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(204,"로그아웃 완료",null));
  }
}
