package com.b102.cracktrack.domain.crack.dto;

import com.b102.cracktrack.domain.crack.entity.Crack;

public record CrackCreateRequestDto(
    String trackingKey,
    Double lidarMax,
    Double lidarMin,
    boolean isCrackDetected
) {

}
