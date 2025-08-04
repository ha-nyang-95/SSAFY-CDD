package com.b102.cracktrack.domain.modeling.dto;

import com.b102.cracktrack.domain.modeling.entity.Modeling;

public record ModelingSummaryResponseDto(
    Long modelId,
    String s3Url,
    String activatedAt
) {

  public static ModelingSummaryResponseDto from(Modeling modeling) {
    return new ModelingSummaryResponseDto(
        modeling.getModelingId(),
        modeling.getS3Url(),
        modeling.getActivatedAt().toString()
    );
  }
}
