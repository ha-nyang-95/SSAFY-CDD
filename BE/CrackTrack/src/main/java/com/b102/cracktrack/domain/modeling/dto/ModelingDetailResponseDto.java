package com.b102.cracktrack.domain.modeling.dto;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.entity.Crack;
import com.b102.cracktrack.domain.modeling.entity.Modeling;
import com.b102.cracktrack.domain.video.dto.VideoResponsetDto;
import com.b102.cracktrack.domain.video.entity.Video;
import java.util.List;

public record ModelingDetailResponseDto(
    Long modelId,
    Long videoId,
    String s3Url,
    List<CrackResponseDto> cracks,
    VideoResponsetDto video
) {

  public static ModelingDetailResponseDto from(Modeling modeling, List<Crack> cracks, Video video) {
    return new ModelingDetailResponseDto(
        modeling.getModelingId(),
        modeling.getVideo().getVideoId(),
        modeling.getS3Url(),
        cracks.stream().map(CrackResponseDto::from).toList(),
        VideoResponsetDto.from(video)
    );
  }
}
