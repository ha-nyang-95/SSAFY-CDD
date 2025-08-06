package com.b102.cracktrack.domain.detection.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.detection.dto.DetectionResponseDto;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/detections")
@RequiredArgsConstructor
public class DetectionController {

  private final DetectionService detectionService;

  @Operation(summary = "디텍팅 단일 조회", description = "디텍팅 영상을 하나만 가져옵니다.")
  @GetMapping("/{detectionId}")
  public ResponseEntity<ApiResult<DetectionResponseDto>> getDetection(
      @PathVariable Long detectionId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(detectionService.findById(detectionId, userPrincipal.getUserId())));
  }


}
