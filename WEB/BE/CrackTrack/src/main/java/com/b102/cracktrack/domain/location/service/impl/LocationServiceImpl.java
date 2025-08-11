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
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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

  /**
   * 기존 로직 변경
   * 방안
   * 지역명 입력받음 있으면 반환
   * 없으면 새로 생성하고 반환
   * @param locationRequestDto 유저가 입력한 지역명
   * @param userId userprincipal을 통해 가져온 id
   * @return 기존 있던 거든 없던 거든 locationResponseDto로 반환
   */
  @Transactional
  @Override
  public LocationResponseDto registerLocation(LocationRequestDto locationRequestDto, Long userId) {
    User u = userRepository.findById(userId).
        orElseThrow(() -> {
          log.error("[LocationService] 잘못된 유저id={}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });

    Optional<Location> existing = locationRepository.findByUserUserIdAndName(userId,
        locationRequestDto.name());
    if (existing.isPresent()) {
      log.info("[LocationService] 지역 재사용, locationId={},name={}",existing.get().getLocationId(),existing.get().getName());
      return LocationResponseDto.from(existing.get());
    }


    Location l = Location.builder()
        .name(locationRequestDto.name())
        .user(u)
        .build();

    try{
      Location save = locationRepository.save(l);
      log.info("[LocationService] 지역 등록 성공, locationId={},name={}",l.getLocationId(),l.getName());
      return LocationResponseDto.from(save);
    }catch (DataIntegrityViolationException dup){
      Location concur = locationRepository.findByUserUserIdAndName(userId, locationRequestDto.name()).orElseThrow(()->dup);
        log.info("[LocationService] 동시성: 기존 지역 반환, locationId={}, name={}",l.getLocationId(),l.getName());
        return LocationResponseDto.from(concur);
    }
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
