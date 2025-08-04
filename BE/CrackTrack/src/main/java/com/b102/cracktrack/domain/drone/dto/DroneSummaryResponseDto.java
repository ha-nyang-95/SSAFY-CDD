package com.b102.cracktrack.domain.drone.dto;

import com.b102.cracktrack.domain.drone.entity.Drone;

public record DroneSummaryResponseDto(
    Long droneId,
    String name
) {

  public static DroneSummaryResponseDto from(Drone drone) {
    return new DroneSummaryResponseDto(drone.getDroneId(), drone.getName());
  }

}
