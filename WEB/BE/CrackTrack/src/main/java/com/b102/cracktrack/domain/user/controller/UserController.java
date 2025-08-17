package com.b102.cracktrack.domain.user.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.security.UserPrincipal;
import com.b102.cracktrack.domain.user.dto.PasswordChangeRequestDto;
import com.b102.cracktrack.domain.user.dto.UserResponseDto;
import com.b102.cracktrack.domain.user.dto.UserUpdateRequestDto;
import com.b102.cracktrack.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.b102.cracktrack.common.util.CookieUtil;

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
  public ResponseEntity<ApiResult<String>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok().body(ApiResult.success(userPrincipal.getRegion()));
  }

  @Operation(summary = "권한 확인", description = "현재 사용자의 권한 정보를 확인합니다.")
  @GetMapping("/role")
  public ResponseEntity<ApiResult<String>> getUserRole(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(ApiResult.success(userPrincipal.getRole()));
  }

  @Operation(summary = "사용자 정보 수정", description = "현재 로그인한 사용자의 정보를 수정합니다.")
  @PutMapping("/update")
  public ResponseEntity<ApiResult<UserResponseDto>> updateUser(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @Valid @RequestBody UserUpdateRequestDto request) {
    
    UserResponseDto updatedUser = userService.updateUser(userPrincipal.getUserId(), request);
    return ResponseEntity.ok(ApiResult.success(200, "사용자 정보 수정 완료", updatedUser));
  }

  @Operation(summary = "비밀번호 변경", description = "현재 로그인한 사용자의 비밀번호를 변경합니다.")
  @PutMapping("/password")
  public ResponseEntity<ApiResult<Void>> changePassword(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @Valid @RequestBody PasswordChangeRequestDto request) {
    
    userService.changePassword(userPrincipal.getUserId(), request);
    return ResponseEntity.ok(ApiResult.success(200, "비밀번호 변경 완료", null));
  }

  @Operation(summary = "회원 탈퇴", description = "현재 로그인한 사용자의 계정을 비활성화(소프트 삭제)합니다.")
  @DeleteMapping("/delete")
  public ResponseEntity<ApiResult<Void>> deleteCurrentUser(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    // 회원 탈퇴 처리
    userService.deleteCurrentUser(userPrincipal.getUserId());

    // 보안 강화를 위해 쿠키 제거 (액세스/리프레시 토큰 삭제)
    HttpHeaders headers = CookieUtil.cleanCookies();

    return ResponseEntity.ok()
        .headers(headers)
        .body(ApiResult.success(204, "회원 탈퇴 완료", null));
  }

}
