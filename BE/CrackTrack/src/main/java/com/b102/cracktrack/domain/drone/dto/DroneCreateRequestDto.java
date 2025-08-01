package com.b102.cracktrack.domain.drone.dto;


import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.user.entity.User;

public record DroneCreateRequestDto(
    String name,
    String serialNumber
) {
  public static Drone from(DroneCreateRequestDto droneCreateRequestDto,String channelArn, User User) {
    return Drone.builder()
        .name(droneCreateRequestDto.name())
        .serialNumber(droneCreateRequestDto.serialNumber())
        .user(User)
        .channelArn(channelArn)
        .build();
  }

}
