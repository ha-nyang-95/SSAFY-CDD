package com.b102.cracktrack.domain.location.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.location.dto.LocationRequestDto;
import com.b102.cracktrack.domain.location.dto.LocationResponseDto;
import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.location.repository.LocationRepository;
import com.b102.cracktrack.domain.location.service.LocationService;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationServiceImpl implements LocationService {

  private final UserRepository userRepository;
  private final LocationRepository locationRepository;

  @Transactional(readOnly = true)
  @Override
  public List<LocationResponseDto> getLocations(Long userId) {
    List<Location> locations = locationRepository.findByUserUserId(userId);
    List<LocationResponseDto> locationResponseDtos = new ArrayList<>();
    for (Location location : locations) {
      locationResponseDtos.add(LocationResponseDto.from(location));
    }
    return locationResponseDtos;
  }

  @Transactional
  @Override
  public LocationResponseDto registerLocation(LocationRequestDto locationRequestDto, Long userId) {
    User u = userRepository.findById(userId).
        orElseThrow(() -> {
          log.error("[LocationService] 잘못된 유저id={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });
    Location l = Location.builder()
        .name(locationRequestDto.name())
        .user(u)
        .build();
    locationRepository.save(l);
    log.info("[LocationService] 지역 등록 성공, locationId={}, locationName={}", l.getLocationId(), l.getName());
    return LocationResponseDto.from(l);
  }

  @Transactional
  @Override
  public void deleteLocation(Long locationId, Long userId) {
    Location l = locationRepository.findById(locationId)
        .orElseThrow(() -> {
          log.error("[LocationService] 존재하지 않는 장소 삭제 시도, locationId={}", locationId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.LOCATION_NOT_FOUND);
        });
        
    if (!l.getUser().getUserId().equals(userId)) {
      log.error("[LocationService] 권한 없는 장소 삭제 시도, locationId={}, userId={}", locationId, userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    
    // 기본 'none' location 삭제 방지
    if ("none".equals(l.getName())) {
      log.warn("[LocationService] 기본 'none' location 삭제 시도 차단, locationId={}, userId={}", locationId, userId);
      throw new ApiException(HttpStatus.BAD_REQUEST.value(), ErrorMessage.DEFAULT_LOCATION_DELETE_FORBIDDEN);
    }
    
    locationRepository.deleteById(locationId);
    log.info("[LocationService] 지역 삭제 성공, locationId={}, locationName={}", locationId, l.getName());
  }
}
