package com.b102.cracktrack.domain.task.dto;


import com.b102.cracktrack.domain.task.entity.Task;

public record TaskResponseDto(
    Long taskId,
    String location,
    String createdAt
) {
  public static TaskResponseDto from(Task task, String location) {
    return new TaskResponseDto(
        task.getTaskId(),
        location,
        task.getActivatedAt().toString()
    );
  }
}
