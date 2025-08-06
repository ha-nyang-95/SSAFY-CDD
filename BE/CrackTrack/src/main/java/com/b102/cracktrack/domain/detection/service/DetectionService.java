package com.b102.cracktrack.domain.detection.service;

import com.b102.cracktrack.domain.detection.dto.DetectionResponseDto;
import java.util.List;

public interface DetectionService {

  List<DetectionResponseDto> findAllByUserId(Long userId);

  List<DetectionResponseDto> findAllByLocationId(Long locationId, Long userId);

  void deleteDetection(Long detectionId);

  DetectionResponseDto findById(Long detectionId, Long userId);

}
