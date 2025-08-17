package com.b102.cracktrack.domain.task.dto;


import com.b102.cracktrack.domain.task.entity.Task;
import java.time.LocalDateTime;

public record TaskResponseDto(
    Long taskId,
    String locationName,
    String status,
    LocalDateTime createdAt
) {
  public static TaskResponseDto from(Task task, String location) {
    return new TaskResponseDto(
        task.getTaskId(),
        location,
        task.getStatus().toString(),
        task.getActivatedAt()
    );
  }
}
