package com.b102.cracktrack.domain.crack.dto;

import com.b102.cracktrack.domain.crack.entity.Crack;
import com.b102.cracktrack.domain.image.entity.Image;
import com.b102.cracktrack.domain.lidar.entity.Lidar;
import com.b102.cracktrack.domain.segment.entity.Segment;
import java.time.LocalDateTime;

public record CrackResponseDto(
    Long crackId,
    String segmentS3Url,
    String imageS3Url,
    String lidarS3Url,
    String status,
    LocalDateTime activatedAt,
    LocalDateTime inActivatedAt
) {

  public static CrackResponseDto from(Crack crack, Segment segment, Lidar lidar, Image image) {
    return new CrackResponseDto(
        crack.getCrackId(),
        segment.getS3Url(),
        lidar.getS3Url(),
        image.getS3Url(),
        crack.getStatus().name(),
        crack.getActivatedAt(),
        crack.getDeactivatedAt()
    );
  }
}
