package com.teto.cracktrack.domain.user.controller;

import com.teto.cracktrack.common.util.ApiResult;
import com.teto.cracktrack.domain.user.dto.UserRequestDto;
import com.teto.cracktrack.domain.user.dto.UserResponseDto;
import com.teto.cracktrack.domain.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "user", description = "유저 관련 API")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

  private final UserService userService;

  @Operation(summary = "회원 가입", description = "시큐리티 구현 후 방식 바뀔 예정")
  @PostMapping("/signUp")
  public ApiResult<UserResponseDto> signUp(@RequestBody UserRequestDto userRequestDto) {
    log.info("[Controller] 회원가입 시도");
    UserResponseDto signUpUser = userService.insertUser(userRequestDto);
    log.info("[Controller] 회원가입 완료");
    return ApiResult.success(signUpUser);
  }

  @Operation(summary = "내 정보 조회", description = "유저의 내 정보")
  @GetMapping("/mypage/{userId}")
  public ApiResult<UserResponseDto> myPage(@PathVariable Long userId) {
    log.info("[Controller] 마이페에지 조회 시도, userId={}", userId);
    UserResponseDto userPage = userService.findByUserId(userId);
    log.info("[Controller] 마이페이지 조회 성공 userId={}", userId);
    return ApiResult.success(userPage);
  }
}
