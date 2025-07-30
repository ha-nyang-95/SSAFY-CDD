package com.b102.cracktrack.domain.drone.service;


import com.b102.cracktrack.domain.drone.dto.DroneCreateRequestDto;
import com.b102.cracktrack.domain.drone.dto.DroneResponseDto;

public interface DroneService {

  DroneResponseDto register(DroneCreateRequestDto droneCreateRequestDto, Long userId);

  DroneResponseDto getMyDron(Long userId);

  boolean checkDroneExist(Long userId);
}
