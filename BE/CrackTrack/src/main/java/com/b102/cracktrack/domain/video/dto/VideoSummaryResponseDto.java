package com.b102.cracktrack.domain.video.dto;

import com.b102.cracktrack.domain.video.entity.Video;

public record VideoSummaryResponseDto(
    Long VideoId,
    String uploadedAt,
    String presignedUrl
) {
  public static VideoSummaryResponseDto from(Video d,String presignedUrl) {
    return new VideoSummaryResponseDto(
        d.getVideoId(),
        d.getActivatedAt().toString(),
        presignedUrl);
  }
}
