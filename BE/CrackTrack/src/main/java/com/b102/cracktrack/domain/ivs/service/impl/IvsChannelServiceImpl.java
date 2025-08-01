package com.b102.cracktrack.domain.ivs.service.impl;

import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.drone.repository.DroneRepository;
import com.b102.cracktrack.domain.ivs.dto.IvsResponeDto;
import com.b102.cracktrack.domain.ivs.entity.IvsChannel;
import com.b102.cracktrack.domain.ivs.processor.IvsChannelProcessor;
import com.b102.cracktrack.domain.ivs.repository.IvsChannelRepository;
import com.b102.cracktrack.domain.ivs.service.IvsChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.ivs.model.Channel;
/**
 * 이후 필요하다면 사용할 예정입니다.
 */
@Service
@RequiredArgsConstructor
public class IvsChannelServiceImpl implements IvsChannelService {

  private final IvsChannelRepository ivsChannelRepository;
  private final IvsChannelProcessor ivsChannelProcessor;
  private final DroneRepository droneRepository;

  @Transactional
  @Override
  public IvsResponeDto registerChannel(Long droneId) {
    Drone d = droneRepository.findById(droneId)
        .orElseThrow(()-> new IllegalArgumentException("드론이 없습니다. 등록해주세요."));
    String channelName = "Drone-"+d.getSerialNumber();
    Channel c = ivsChannelProcessor.createChannel(channelName);
    IvsChannel ivs = IvsChannel
        .builder()
        .droneId(droneId)
        .channelArn(c.arn())
        .userId(d.getUser().getUserId())
        .build();
    ivsChannelRepository.save(ivs);
    return null;
  }

  @Transactional
  @Override
  public void deleteChannel(Long ivsChannelId) {
    IvsChannel ivs = ivsChannelRepository.findById(ivsChannelId)
        .orElseThrow(() -> new IllegalArgumentException("Ivs 채널이 없습니다."));
    ivsChannelRepository.delete(ivs);
  }

  @Transactional(readOnly = true)
  @Override
  public IvsResponeDto findByUserId(Long userId) {
    IvsChannel ivs = ivsChannelRepository.findByUserId(userId)
        .orElseThrow(() -> new IllegalArgumentException("유저 Id로 Ivs채널을 찾을 수 없습니다."));
    return null ;
  }

  @Transactional(readOnly = true)
  @Override
  public IvsResponeDto findByDroneId(Long droneId) {
    IvsChannel ivs = ivsChannelRepository.findByDroneId(droneId)
        .orElseThrow(()-> new IllegalArgumentException("드론 Id로 Ivs채널을 찾을 수 없습니다."));
    return null;
  }
}
