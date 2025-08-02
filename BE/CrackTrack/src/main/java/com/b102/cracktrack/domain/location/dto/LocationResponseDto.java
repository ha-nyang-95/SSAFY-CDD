package com.b102.cracktrack.domain.location.dto;

import com.b102.cracktrack.domain.location.entity.Location;

public record LocationResponseDto(
    Long LocationId,
    String name,
    Double latitude,
    Double longitude
) {

  public static LocationResponseDto of(Location location) {
    return new LocationResponseDto(
        location.getLocationId(),
        location.getName(),
        location.getLatitude(),
        location.getLongitude());
  }
}
