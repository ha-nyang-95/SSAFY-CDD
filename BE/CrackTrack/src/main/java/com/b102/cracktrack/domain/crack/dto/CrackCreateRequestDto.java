package com.b102.cracktrack.domain.crack.dto;

import com.b102.cracktrack.domain.crack.entity.Crack;

public record CrackCreateRequestDto(
    String trackingKey,
    Double lidarMax,
    Double lidarMin,
    boolean isCrackDetected
) {

  public static Crack of(CrackCreateRequestDto createRequestDto) {
    return Crack.builder()
        .trackingKey(createRequestDto.trackingKey)
        .lidarMax(createRequestDto.lidarMax)
        .lidarMin(createRequestDto.lidarMin)
        .build();
  }

}
