package com.b102.cracktrack.domain.ivs.service;

import com.b102.cracktrack.domain.ivs.dto.IvsResponeDto;

/**
 * 이후 필요하다면 사용할 예정입니다.
 */
public interface IvsChannelService {

  IvsResponeDto registerChannel(Long droneId);

  void deleteChannel(Long ivsChannelId);

  IvsResponeDto findByUserId(Long userId);
  IvsResponeDto findByDroneId(Long droneId);


}
