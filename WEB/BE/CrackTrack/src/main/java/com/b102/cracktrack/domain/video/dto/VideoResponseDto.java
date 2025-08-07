package com.b102.cracktrack.domain.video.dto;

import java.time.LocalDateTime;

public record VideoResponseDto(
    Long videoId,
    String s3Url
) {

}
