package com.b102.cracktrack.domain.drone.dto;


import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.user.entity.User;

public record DroneCreateRequestDto(
    String name,
    String serialNumber
) {
  public static Drone of(DroneCreateRequestDto droneCreateRequestDto,String channelArn, User User) {
    return Drone.builder()
        .name(droneCreateRequestDto.name())
        .serialNumber(droneCreateRequestDto.serialNumber())
        .user(User)
        .build();
  }

}
