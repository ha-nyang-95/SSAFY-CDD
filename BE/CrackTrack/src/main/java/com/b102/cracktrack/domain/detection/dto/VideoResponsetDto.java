package com.b102.cracktrack.domain.detection.dto;


import com.b102.cracktrack.domain.detection.entity.Video;

public record VideoResponsetDto(
    Long videoId,
    Long userId,
    Long locationId,
    String s3Url,
    String activatedAt
) {

  public static VideoResponsetDto from(Video video) {
    return new VideoResponsetDto(
        video.getVideoId(),
        video.getUser().getUserId(),
        video.getLocationId(),
        video.getS3Url(),
        video.getActivatedAt().toString()
    );
  }

}
