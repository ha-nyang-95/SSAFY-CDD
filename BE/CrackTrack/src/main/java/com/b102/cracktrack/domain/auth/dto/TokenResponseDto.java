package com.b102.cracktrack.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "토큰 응답 DTO")
public record TokenResponseDto(
    @Schema(description = "사용자 ID")
    Long userId,

    @Schema(description = "이메일")
    String email,

    @Schema(description = "사용자 이름")
    String name,

    @Schema(description = "권한")
    String role
) {

}
