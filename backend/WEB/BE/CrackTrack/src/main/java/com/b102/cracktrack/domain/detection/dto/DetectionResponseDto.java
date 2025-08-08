package com.b102.cracktrack.domain.detection.dto;

import com.b102.cracktrack.domain.detection.entity.Detection;
import java.time.LocalDateTime;

public record DetectionResponseDto(
    Long detectionId,
    LocalDateTime taskCreateTime,
    String s3Url
) {

  public static DetectionResponseDto from(Detection detection) {
    return new DetectionResponseDto(
        detection.getDetectionId(),
        detection.getTask().getActivatedAt(),
        detection.getS3Url()
    );
  }

}
