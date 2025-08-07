package com.b102.cracktrack.domain.location.service;

import com.b102.cracktrack.domain.location.dto.LocationRequestDto;
import com.b102.cracktrack.domain.location.dto.LocationResponseDto;
import java.util.List;

public interface LocationService {

  List<LocationResponseDto> getLocations(Long userId);

  LocationResponseDto registerLocation(LocationRequestDto locationRequestDto, Long userId);

  void deleteLocation(Long locationId, Long userId);
}
