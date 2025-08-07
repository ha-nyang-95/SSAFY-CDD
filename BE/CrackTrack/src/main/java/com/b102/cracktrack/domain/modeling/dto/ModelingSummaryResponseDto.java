package com.b102.cracktrack.domain.modeling.dto;

import java.time.LocalDateTime;

public record ModelingSummaryResponseDto(
    Long modelingId,
    String s3Url,
    LocalDateTime activatedAt
) {

}
