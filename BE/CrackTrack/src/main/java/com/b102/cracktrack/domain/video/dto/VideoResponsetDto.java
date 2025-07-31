package com.b102.cracktrack.domain.video.dto;


import com.b102.cracktrack.domain.video.entity.Video;

public record VideoResponsetDto(
    Long VideoId,
    String s3key,
    String presignedUrl,
    String uploadedAt
) {
  public static VideoResponsetDto from(Video video, String url) {
    return new VideoResponsetDto(
        video.getVideoId(),
        video.getS3key(),
        url,
        video.getActivatedAt().toString()
    );
  }

}
