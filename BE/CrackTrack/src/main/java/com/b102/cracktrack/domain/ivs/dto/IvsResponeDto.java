package com.b102.cracktrack.domain.ivs.dto;

import com.b102.cracktrack.domain.ivs.entity.IvsChannel;

public record IvsResponeDto(
    String channelArn,
    Long droneId,
    Long userId
) {

}
