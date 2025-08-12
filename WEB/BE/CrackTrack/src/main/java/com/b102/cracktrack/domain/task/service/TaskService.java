package com.b102.cracktrack.domain.task.service;

import com.b102.cracktrack.domain.task.dto.TaskDetailResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskFirstResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import java.util.List;

public interface TaskService {

  // 디스트릭트 문자열(Region + 구/시 등) 파싱 기반 작업 생성
  TaskFirstResponseDto createTask(String districtPath, Long userId);

  void deleteTask(Long taskId, Long userId);

  void completeTask(String s3Name);

  // 디스트릭트 기준 작업 목록 조회
  List<TaskResponseDto> findByDistrictId(Long districtId, Long userId);

  List<TaskResponseDto> findAllTasks(Long userId);

  TaskDetailResponseDto findTaskDetails(Long taskId, Long userId);

  TaskDetailResponseDto writeDescription(Long taskId, Long userId, String description);
}
