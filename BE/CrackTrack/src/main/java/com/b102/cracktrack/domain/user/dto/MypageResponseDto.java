package com.b102.cracktrack.domain.user.dto;

import com.b102.cracktrack.domain.drone.dto.DroneResponseDto;
import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.location.dto.LocationResponseDto;
import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.user.entity.User;
import java.util.List;

public record MypageResponseDto(
    String email,
    String name,
    String role,
    List<DroneResponseDto> drones,
    List<LocationResponseDto> locations
) {
  public static MypageResponseDto from(User user, List<Drone> drones, List<Location> locations) {
    return new MypageResponseDto(
        user.getEmail(),
        user.getName(),
        user.getRole().name(),
        drones.stream().map(DroneResponseDto::from).toList(),
        locations.stream().map(LocationResponseDto::from).toList()
    );
  }

}
