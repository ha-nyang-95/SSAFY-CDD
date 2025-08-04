package com.b102.cracktrack.domain.modeling.dto;

import com.b102.cracktrack.domain.modeling.entity.Modeling;

public record ModelingResponseDto(
    Long modelId,
    Long videoId,
    String s3Url,
    String activatedAt
) {

  public static ModelingResponseDto from(Modeling modeling) {
    return new ModelingResponseDto(
        modeling.getModelingId(),
        modeling.getVideo().getVideoId(),
        modeling.getS3Url(),
        modeling.getActivatedAt().toString()
    );
  }
}
