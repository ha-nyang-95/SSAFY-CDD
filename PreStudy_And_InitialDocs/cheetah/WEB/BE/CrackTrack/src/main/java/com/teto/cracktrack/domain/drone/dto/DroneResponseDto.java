package com.teto.cracktrack.domain.drone.dto;

import com.teto.cracktrack.domain.drone.entity.Drone;

public record DroneResponseDto(
    Long droneId,
    String userName,
    String serialNumber
) {
  public static DroneResponseDto of(Drone drone) {
    return new DroneResponseDto(
        drone.getDroneId(),
        drone.getName(),
        drone.getSerialNumber()
    );
  }

}
