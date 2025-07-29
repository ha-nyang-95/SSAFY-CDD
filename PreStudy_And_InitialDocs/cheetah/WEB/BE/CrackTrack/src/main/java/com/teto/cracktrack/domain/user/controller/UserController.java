package com.teto.cracktrack.domain.user.controller;

import com.teto.cracktrack.common.util.ApiResult;
import com.teto.cracktrack.domain.security.UserPrincipal;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;
import com.teto.cracktrack.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "유저", description = "유저 관련 API")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Validated
@Slf4j
public class UserController {

  private final UserService userService;

  @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.(마이페이지)")
  @GetMapping("/mypage")
  public ApiResult<UserResponseDto> myPage(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    log.info("[Controller] 마이페이지 조회 시도, userId={}, email={}",
        userPrincipal.getUserId(), userPrincipal.getEmail());

    UserResponseDto userPage = userService.findByUserId(userPrincipal.getUserId());

    log.info("[Controller] 마이페이지 조회 성공 userId={}", userPrincipal.getUserId());
    return ApiResult.success(userPage);
  }

  @Operation(summary = "현재 사용자 정보", description = "현재 로그인한 사용자의 기본 정보를 반환합니다.(상태바)")
  @GetMapping("/me")
  public ApiResult<UserPrincipal> getCurrentUser(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    log.info("[Controller] 현재 사용자 정보 조회, userId={}, email={}",
        userPrincipal.getUserId(), userPrincipal.getEmail());

    return ApiResult.success(userPrincipal);
  }

  @Operation(summary = "권한 확인", description = "현재 사용자의 권한 정보를 확인합니다.")
  @GetMapping("/role")
  public ApiResult<String> getUserRole(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    log.info("[Controller] 사용자 권한 조회, userId={}, role={}",
        userPrincipal.getUserId(), userPrincipal.getRole());

    return ApiResult.success(userPrincipal.getRole());
  }

}
