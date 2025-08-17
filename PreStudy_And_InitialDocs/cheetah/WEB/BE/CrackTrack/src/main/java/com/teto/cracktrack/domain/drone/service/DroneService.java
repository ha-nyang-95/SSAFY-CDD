package com.teto.cracktrack.domain.drone.service;

import com.teto.cracktrack.domain.drone.dto.DroneCreateRequestDto;
import com.teto.cracktrack.domain.drone.dto.DroneResponseDto;

public interface DroneService {

  DroneResponseDto register(DroneCreateRequestDto droneCreateRequestDto, Long userId);

  DroneResponseDto getMyDron(Long userId);
}
