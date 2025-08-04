package com.b102.cracktrack.domain.drone.service.impl;

import com.b102.cracktrack.domain.drone.dto.DroneCreateRequestDto;
import com.b102.cracktrack.domain.drone.dto.DroneResponseDto;
import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.drone.repository.DroneRepository;
import com.b102.cracktrack.domain.drone.service.DroneService;
import com.b102.cracktrack.common.aws.IvsChannelProcessor;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.ivs.model.Channel;

@Service
@RequiredArgsConstructor
@Slf4j
public class DroneServiceImpl implements DroneService {

  private final DroneRepository droneRepository;
  private final UserRepository userRepository;
  private final IvsChannelProcessor ivsChannelProcessor;

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

    String channelName = "Drone-"+droneCreateRequestDto.serialNumber();
    Channel createChannel = ivsChannelProcessor.createChannel(channelName);

    // 3. 드론 생성 및 저장
    Drone d = DroneCreateRequestDto.of(droneCreateRequestDto, createChannel.arn(),u);
    droneRepository.save(d);

    log.info("[Service] 드론 등록 성공, droneId={}", d.getDroneId());
    return DroneResponseDto.from(d);
  }

  @Override
  public DroneResponseDto update(Long DroneId, DroneCreateRequestDto droneCreateRequestDto,
      Long userId) {
    return null;
  }

  @Override
  public DroneResponseDto delete(Long DroneId, Long userId) {
    return null;
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
    return DroneResponseDto.from(d);
  }

  @Transactional(readOnly = true)
  @Override
  public boolean checkDroneExist(Long userId) {
    return droneRepository.existsByUser_UserId(userId);
  }
}
