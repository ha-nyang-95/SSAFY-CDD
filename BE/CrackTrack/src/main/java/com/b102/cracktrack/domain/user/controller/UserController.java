package com.b102.cracktrack.domain.user.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.security.UserPrincipal;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저", description = "유저 관련 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Validated
@Slf4j
public class UserController {

  private final UserService userService;

  @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.(마이페이지)")
  @GetMapping("/mypage")
  public ResponseEntity<ApiResult<UserResponseDto>> myPage(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    UserResponseDto userPage = userService.findByUserId(userPrincipal.getUserId());
    return ResponseEntity.ok().body(ApiResult.success(userPage));
  }

  @Operation(summary = "현재 사용자 정보", description = "현재 로그인한 사용자의 기본 정보를 반환합니다.(상태바)")
  @GetMapping("/me")
  public ResponseEntity<ApiResult<UserPrincipal>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok().body(ApiResult.success(userPrincipal));
  }

  @Operation(summary = "권한 확인", description = "현재 사용자의 권한 정보를 확인합니다.")
  @GetMapping("/role")
  public ResponseEntity<ApiResult<String>> getUserRole(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(ApiResult.success(userPrincipal.getRole()));
  }

}
