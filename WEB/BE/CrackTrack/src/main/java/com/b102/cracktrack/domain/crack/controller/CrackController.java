package com.b102.cracktrack.domain.crack.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.service.CrackService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cracks")
@RequiredArgsConstructor
public class CrackController {

  private final CrackService crackService;

  @Operation(summary = "균열 상세 조회", description = "균열 1개에 대해 라이더 값, 세그멘트, 원본이미지를 url을 제공합니다.")
  @GetMapping("/{crackId}")
  public ResponseEntity<ApiResult<CrackResponseDto>> select(@PathVariable Long crackId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(ApiResult.success(crackService.findCrackById(crackId,
        userPrincipal.getUserId())));
  }

  @Operation(summary = "균열 삭제", description = "균열의 정보를 보고 사용자가 삭제 요청을 보냅니다.")
  @DeleteMapping("/{crackId}")
  public ResponseEntity<ApiResult<Void>> delete(@PathVariable Long crackId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    crackService.deleteCrack(crackId, userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(null));
  }

  @Operation(summary = "균열 검사", description = "균열에 대해 이미 인지하고 있거나 관리했다는 마킹")
  @PutMapping("/{crackId}")
  public ResponseEntity<ApiResult<CrackResponseDto>> checkedCrack(@PathVariable Long crackId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(crackService.checkCrack(crackId, userPrincipal.getUserId())));
  }

  @Operation(summary = "작업에 전체 균열 조회", description = "한 번의 작업에 생긴 모든 균열 정보를 불러옵니다.")
  @GetMapping("/task/{taskId}")
  public ResponseEntity<ApiResult<List<CrackResponseDto>>> selectAll(@PathVariable Long taskId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(crackService.findCracksByTaskId(taskId, userPrincipal.getUserId())));
  }
}
