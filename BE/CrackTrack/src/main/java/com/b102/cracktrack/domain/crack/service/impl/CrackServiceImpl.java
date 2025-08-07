package com.b102.cracktrack.domain.crack.service.impl;

import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.repository.CrackRepository;
import com.b102.cracktrack.domain.crack.service.CrackService;
import com.b102.cracktrack.domain.image.repository.ImageRepository;
import com.b102.cracktrack.domain.lidar.repository.LidarRepository;
import com.b102.cracktrack.domain.segment.repository.SegmentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrackServiceImpl implements CrackService {

  private final CrackRepository crackRepository;
  private final LidarRepository lidarRepository;
  private final SegmentRepository segmentRepository;
  private final ImageRepository imageRepository;


  @Override
  public void createCrack(String trackingKey, String url) {
    
  }

  @Override
  public void deleteCrack(Long CrackId) {

  }

  @Override
  public CrackResponseDto checkCrack(Long CrackId) {
    return null;
  }

  @Override
  public List<CrackResponseDto> findCracksByTaskId(Long taskId) {
    return List.of();
  }

  @Override
  public CrackResponseDto findCrackById(Long crackId) {
    return null;
  }
}
