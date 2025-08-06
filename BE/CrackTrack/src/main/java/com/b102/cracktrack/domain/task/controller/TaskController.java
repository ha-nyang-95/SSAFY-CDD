package com.b102.cracktrack.domain.task.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.security.UserPrincipal;
import com.b102.cracktrack.domain.task.dto.TaskDetailResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskFirstResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import com.b102.cracktrack.domain.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api`")
@RequiredArgsConstructor
public class TaskController {

  private final TaskService taskService;

  @Operation(summary = "작업 생성", description = "유저가 모듈에 입력할 저장소 코드를 받습니다.")
  @PostMapping("/tasks/{locationId}")
  public ResponseEntity<ApiResult<TaskFirstResponseDto>> createTask(@PathVariable Long locationId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(taskService.createTask(locationId, userPrincipal.getUserId())));
  }

  @Operation(summary = "작업 삭제", description = "유저가 작업을 삭제합니다.")
  @DeleteMapping("/task/{taskId}")
  public ResponseEntity<ApiResult<Void>> deleteTask(@PathVariable Long taskId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    taskService.deleteTask(taskId, userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(204, "삭제 성공", null));
  }

  @Operation(summary = "지역별 작업 목록 조회", description = "유저가 갖고 있는 지역별로 했던 모든 작업을 가져옵니다.")
  @GetMapping("/tasks/location/{locationId}")
  public ResponseEntity<ApiResult<List<TaskResponseDto>>> getAllTasksByLocation(
      @PathVariable Long locationId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(taskService.findByLocationId(locationId, userPrincipal.getUserId())));
  }

  @Operation(summary = "전체 작업 목록 조회", description = "유저가 갖고 있는 모든 작업을 가져옵니다.")
  @GetMapping("/tasks")
  public ResponseEntity<ApiResult<List<TaskResponseDto>>> getAllTasks(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(taskService.findAllTasks(userPrincipal.getUserId())));
  }

  @Operation(summary = "작업 상세 조회", description = "작업에 대한 모든 정보를 가져옵니다.")
  @GetMapping("/task/{taskId}")
  public ResponseEntity<ApiResult<TaskDetailResponseDto>> findTask(@PathVariable Long taskId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ResponseEntity.ok(
        ApiResult.success(taskService.findTaskDetails(taskId, userPrincipal.getUserId())));
  }
}
