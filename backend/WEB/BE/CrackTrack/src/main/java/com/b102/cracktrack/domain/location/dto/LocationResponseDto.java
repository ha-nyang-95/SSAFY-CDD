package com.b102.cracktrack.domain.location.dto;

import com.b102.cracktrack.domain.location.entity.Location;

public record LocationResponseDto(
    Long LocationId,
    String name
) {

  public static LocationResponseDto from(Location location) {
    return new LocationResponseDto(
        location.getLocationId(),
        location.getName());
  }
}
