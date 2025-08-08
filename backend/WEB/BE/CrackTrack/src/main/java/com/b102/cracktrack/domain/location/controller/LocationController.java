package com.b102.cracktrack.domain.location.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.location.dto.LocationRequestDto;
import com.b102.cracktrack.domain.location.dto.LocationResponseDto;
import com.b102.cracktrack.domain.location.service.LocationService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "지역", description = "유저마다 각자의 리스트로 관리")
@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

  private final LocationService locationService;

  @Operation(summary = "지역등록", description = "유저가 필요한 칼럼을 추가합니다.")
  @PostMapping("/register")
  public ResponseEntity<ApiResult<LocationResponseDto>> registerLocation(@AuthenticationPrincipal
  UserPrincipal userPrincipal, @Valid @RequestBody LocationRequestDto locationRequestDto) {
    LocationResponseDto responseDto = locationService.registerLocation(locationRequestDto,
        userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(200, "등록 성공", responseDto));
  }

  @Operation(summary = "지역 삭제", description = "겹치는 지역 등 여러 이유로 칼럼을 삭제할 수 있습니다./관리자는 이후에 구현")
  @DeleteMapping("/remove/{locationId}")
  public ResponseEntity<ApiResult<Void>> deleteLocation(
      @AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long locationId) {
    locationService.deleteLocation(locationId, userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(204, "삭제 성공", null));
  }

  @Operation(summary = "지역 조회", description = "영상 촬영을 하기전에 각자 등록한 지역모두를 리스트업합니다.")
  @GetMapping("/list")
  public ResponseEntity<ApiResult<List<LocationResponseDto>>> getLocations(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<LocationResponseDto> locations = locationService.getLocations(userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(locations));
  }

}
