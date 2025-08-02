package com.b102.cracktrack.domain.location.service.impl;

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
      locationResponseDtos.add(LocationResponseDto.of(location));
    }
    return locationResponseDtos;
  }

  @Transactional
  @Override
  public LocationResponseDto registerLocation(LocationRequestDto locationRequestDto, Long userId) {
    User u = userRepository.findById(userId).
        orElseThrow(() -> {
          log.error("[Service] 잘못된 유저id={}", userId);
          return new IllegalArgumentException("유저 조회 실패");
        });
    Location l = Location.builder()
        .name(locationRequestDto.name())
        .latitude(locationRequestDto.latitude())
        .longitude(locationRequestDto.longitude())
        .user(u)
        .build();
    locationRepository.save(l);
    log.info("[Service] 지역 등록 성공");
    return LocationResponseDto.of(l);
  }

  @Transactional
  @Override
  public void deleteLocation(Long locationId, Long userId) {
    Location l = locationRepository.findById(locationId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다."));
    if (!l.getUser().getUserId().equals(userId)) {
      throw new IllegalAccessError("본인의 장소만 삭제할 수 있습니다.");
    }
    locationRepository.deleteById(locationId);
    log.info("[Service] 지역 삭제 성공");
  }
}
