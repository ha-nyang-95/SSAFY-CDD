package com.b102.cracktrack.domain.drone.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.drone.dto.DroneCreateRequestDto;
import com.b102.cracktrack.domain.drone.dto.DroneResponseDto;
import com.b102.cracktrack.domain.drone.service.DroneService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/drone")
@Tag(name = "드론", description = "드론 등록 API")
public class DroneController {

  private final DroneService droneService;

  @Operation(summary = "드론 등록",description = "로그인 한 유저의 드론과 1:1 등록합니다.")
  @PostMapping("/register")
  public ResponseEntity<ApiResult<DroneResponseDto>> register(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @RequestBody DroneCreateRequestDto droneCreateRequestDto
  ) {
    Long userId = userPrincipal.getUserId();
    DroneResponseDto responseDto = droneService.register(droneCreateRequestDto, userId);
    return ResponseEntity.ok()
        .body(ApiResult.success(responseDto));
  }

  @Operation(summary = "드론 조회",description = "본인에게 등록된 드론을 조회합니다.")
  @GetMapping("/me")
  public ResponseEntity<ApiResult<DroneResponseDto>> me(
      @AuthenticationPrincipal UserPrincipal userPrincipal
  ) {
    Long userId = userPrincipal.getUserId();
    DroneResponseDto responseDto= droneService.getMyDron(userId);
    return ResponseEntity.ok()
        .body(ApiResult.success(responseDto));
  }


}
