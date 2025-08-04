package com.b102.cracktrack.domain.crack.dto;

import com.b102.cracktrack.domain.crack.entity.Crack;

public record CrackResponseDto(
    Long crackId,
    boolean isCrackDetected,
    Double lidarMax,
    Double lidarMin,
    String s3Url,
    String status,
    String activatedAt,
    String deactivatedAt,
    String deletedAt
) {

  public static CrackResponseDto from(Crack crack) {
    return new CrackResponseDto(
        crack.getCrackId(),
        crack.isCrackDetected(),
        crack.getLidarMax(),
        crack.getLidarMin(),
        crack.getS3Url(),
        crack.getStatus().name(),
        crack.getActivatedAt().toString(),
        crack.getDeactivatedAt().toString(),
        crack.getDeletedAt().toString()
    );
  }
}
