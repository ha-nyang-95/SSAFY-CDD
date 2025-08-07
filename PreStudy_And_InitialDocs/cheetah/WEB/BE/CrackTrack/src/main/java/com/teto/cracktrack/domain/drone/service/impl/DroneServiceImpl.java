package com.teto.cracktrack.domain.drone.service.impl;

import com.teto.cracktrack.domain.drone.dto.DroneCreateRequestDto;
import com.teto.cracktrack.domain.drone.dto.DroneResponseDto;
import com.teto.cracktrack.domain.drone.entity.Drone;
import com.teto.cracktrack.domain.drone.repository.DroneRepository;
import com.teto.cracktrack.domain.drone.service.DroneService;
import com.teto.cracktrack.domain.user.entity.User;
import com.teto.cracktrack.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DroneServiceImpl implements DroneService {

  private final DroneRepository droneRepository;
  private final UserRepository userRepository;

  @Transactional
  @Override
  public DroneResponseDto register(DroneCreateRequestDto droneCreateRequestDto, Long userId) {
    // 1. 이미 등록된 드론이 있는지 먼저 체크
    boolean exists = droneRepository.existsByUser_UserId(userId);
    if (exists) {
      log.warn("[Service] 이미 드론을 등록한 유저, UserId={}", userId);
      throw new IllegalStateException("이미 드론을 등록한 유저입니다.");
    }

    // 2. 유저가 실제로 존재하는지 체크
    User u = userRepository.findById(userId)
        .orElseThrow(() -> {
          return new IllegalArgumentException("잘못된 유저입니다.");
        });

    // 3. 드론 생성 및 저장
    Drone d = DroneCreateRequestDto.from(droneCreateRequestDto, u);
    d.setActive();
    droneRepository.save(d);

    log.info("[Service] 드론 등록 성공, droneId={}", d.getDroneId());
    return DroneResponseDto.of(d);
  }

  @Transactional(readOnly = true)
  @Override
  public DroneResponseDto getMyDron(Long userId) {
    Drone d = droneRepository.findByUser_UserId(userId)
        .orElseThrow(()->{
          log.warn("[Service] 해당 유저의 드론이 존재하지 않음, userId={}", userId);
          return new IllegalArgumentException("등록된 드론이 없습니다.");
        });
    log.info("[Service] 드론조회 성공, droneId={}, userId={}", d.getDroneId(), userId);
    return DroneResponseDto.of(d);
  }
}
