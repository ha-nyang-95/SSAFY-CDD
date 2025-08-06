package com.b102.cracktrack.domain.user.dto;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.detection.dto.DetectionResponseDto;
import com.b102.cracktrack.domain.location.dto.LocationResponseDto;
import com.b102.cracktrack.domain.modeling.dto.ModelingSummaryResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import com.b102.cracktrack.domain.video.dto.VideoResponseDto;
import java.util.List;

public record MypageResponseDto(
    String email,
    String name,
    String role,
    List<TaskResponseDto> tasks,
    List<LocationResponseDto> location,
    List<VideoResponseDto> videos,
    List<DetectionResponseDto> detections,
    List<ModelingSummaryResponseDto> modelings,
    List<CrackResponseDto> cracks
) {

}
