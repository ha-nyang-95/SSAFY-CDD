package com.b102.cracktrack.domain.drone.dto;

import com.b102.cracktrack.domain.drone.entity.Drone;

public record DroneFirstResponseDto(
    Long droneId,
    String serialNumber,
    String streamKey,
    String streamEndpoint,
    String trackingKey
) {

  public static DroneFirstResponseDto from(Drone drone) {
    return new DroneFirstResponseDto(
        drone.getDroneId(),
        drone.getSerialNumber(),
        drone.getStreamKey(),
        drone.getIvsEndpoint(),
        drone.getTrackingKey()
    );
  }

}
