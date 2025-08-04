package com.b102.cracktrack.domain.drone.dto;


import com.b102.cracktrack.domain.drone.entity.Drone;

public record DroneResponseDto(
    Long droneId,
    String name,
    String serialNumber
) {

  public static DroneResponseDto from(Drone drone) {
    return new DroneResponseDto(
        drone.getDroneId(),
        drone.getName(),
        drone.getSerialNumber()
    );
  }
}
