package com.teto.cracktrack.domain.drone.dto;

import com.teto.cracktrack.domain.drone.entity.Drone;
import com.teto.cracktrack.domain.user.entity.User;

public record DroneCreateRequestDto(
    String name,
    String serialNumber
) {
  public static Drone from(DroneCreateRequestDto droneCreateRequestDto, User User) {
    return Drone.builder()
        .name(droneCreateRequestDto.name())
        .serialNumber(droneCreateRequestDto.serialNumber())
        .user(User)
        .build();
  }

}
