package com.b102.cracktrack.domain.task.service;


import com.b102.cracktrack.domain.task.dto.TaskDetailResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskFirstResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import java.util.List;

public interface TaskService {

  TaskFirstResponseDto createTask(Long locationId, Long userId);

  void deleteTask(Long taskId, Long userId);

  void completeTask(String s3Name);

  List<TaskResponseDto> findByLocationId(Long locationId, Long userId);

  List<TaskResponseDto> findAllTasks(Long userId);

  TaskDetailResponseDto findTaskDetails(Long taskId, Long userId);

  TaskDetailResponseDto writeDescription(Long taskId, Long userId, String description);
}
