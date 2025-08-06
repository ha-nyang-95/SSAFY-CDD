package com.b102.cracktrack.domain.task.dto;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import java.util.List;

public record TaskDetailResponseDto(
    Long taskId,
    String locationName,
    String detectionURL,
    String modelingURL,
    String videoURL,
    List<CrackResponseDto> cracks
) {

}
