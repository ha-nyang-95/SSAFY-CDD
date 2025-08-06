package com.b102.cracktrack.domain.detection.dto;

import com.b102.cracktrack.domain.detection.entity.Video;

public record VideoSummaryResponseDto(
    Long VideoId,
    String s3Url,
    String activatedAt
) {

  public static VideoSummaryResponseDto from(Video video) {
    return new VideoSummaryResponseDto(
        video.getVideoId(),
        video.getS3Url(),
        video.getActivatedAt().toString()
    );
  }
}
