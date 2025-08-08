package com.b102.cracktrack.domain.task.dto;

import com.b102.cracktrack.domain.task.entity.Task;

public record TaskFirstResponseDto(
    Long taskId,
    Long userId,
    String location,
    String s3Name
) {

  public static TaskFirstResponseDto from(Task task, String location) {
    return new TaskFirstResponseDto(
        task.getTaskId(),
        task.getUser().getUserId(),
        location,
        task.getS3Name()
    );
  }

}
