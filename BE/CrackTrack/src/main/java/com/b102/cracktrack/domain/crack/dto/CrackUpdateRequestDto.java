package com.b102.cracktrack.domain.crack.dto;

public record CrackUpdateRequestDto(
    String trackingKey,
    String s3Url
) {

}
