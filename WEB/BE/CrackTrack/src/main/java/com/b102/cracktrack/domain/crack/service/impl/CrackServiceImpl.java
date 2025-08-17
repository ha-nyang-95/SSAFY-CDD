package com.b102.cracktrack.domain.crack.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.entity.Crack;
import com.b102.cracktrack.domain.crack.repository.CrackRepository;
import com.b102.cracktrack.domain.crack.service.CrackService;
import com.b102.cracktrack.domain.image.entity.Image;
import com.b102.cracktrack.domain.image.repository.ImageRepository;
import com.b102.cracktrack.domain.lidar.entity.Lidar;
import com.b102.cracktrack.domain.lidar.repository.LidarRepository;
import com.b102.cracktrack.domain.segment.entity.Segment;
import com.b102.cracktrack.domain.segment.repository.SegmentRepository;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrackServiceImpl implements CrackService {

  private final CrackRepository crackRepository;
  private final LidarRepository lidarRepository;
  private final SegmentRepository segmentRepository;
  private final ImageRepository imageRepository;
  private final TaskRepository taskRepository;



  @Transactional
  @Override
  public void deleteCrack(Long crackId, Long userId) {
    log.info("균열 삭제: crackId:{}, userId:{}", crackId, userId);
    Crack c = crackRepository.findById(crackId).orElseThrow(() -> {
      log.error("균열 삭제 실패: 균열없음 crackId: {}", crackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    if (!c.getTask().getUser().getUserId().equals(userId)) {
      log.error("균열 삭제 실패: 유저 권한 없음 균열 등록 유저Id: {} ,userId : {}", c.getTask().getUser().getUserId(),
          userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    c.softDelete();
    log.info("균열 삭제 성공: crackId: {}", c.getCrackId());
  }

  @Transactional
  @Override
  public CrackResponseDto checkCrack(Long crackId, Long userId) {
    log.info("균열 비활성화: crackId:{}, userId:{}", crackId, userId);
    Crack c = crackRepository.findById(crackId).orElseThrow(() -> {
      log.error("균열 비활성화 실패: 균열없음 crackId: {}", crackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    if (!c.getTask().getUser().getUserId().equals(userId)) {
      log.error("균열 비활성화 실패: 유저 권한없음. 균열 등록 유저Id :{}, userId : {}",
          c.getTask().getUser().getUserId(), userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    c.setInactive();

    Long currentCrackId = c.getCrackId();
    Image image = imageRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
      log.error("균열 비활성화 실패: 이미지 없음 crackId: {}", currentCrackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    Segment segment = segmentRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
      log.error("균열 비활성화 실패: 세그먼트 없음 crackId: {}", currentCrackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    Lidar lidar = lidarRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
      log.error("균열 비활성화 실패: 라이더 없음 crackId: {}", currentCrackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    log.info("균열 비활성화 성공: crackId: {}", c.getCrackId());
    return CrackResponseDto.from(c, segment, lidar, image);
  }

  @Transactional(readOnly = true)
  @Override
  public List<CrackResponseDto> findCracksByTaskId(Long taskId, Long userId) {

    log.info("균열 작업별 목록 불러오기: taskId:{}", taskId);
    List<Crack> cracks = crackRepository.findByTaskTaskId(taskId);

    // 균열이 없는 경우 빈 리스트 반환 (정상적인 상황)
    if (cracks.isEmpty()) {
      log.info("균열 작업별 목록 불러오기 완료: taskId:{} - 탐지된 균열 없음", taskId);
      return List.of(); // 빈 리스트 반환
    }
    
    // 첫 번째 균열의 작업 소유자 확인 (권한 체크)
    if (!cracks.get(0).getTask().getUser().getUserId().equals(userId)) {
      log.error("균열 작업별 목록 불러오기 실패: 유저 권한없음. 균열 등록 유저Id :{}, userId : {}",
          cracks.get(0).getTask().getUser().getUserId(), userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    
    log.info("균열 작업별 목록 불러오기 성공: userId:{}, taskId:{}, 균열 개수:{}", userId, taskId, cracks.size());
    return cracks.stream()
        .map(crack -> {
          Long currentCrackId = crack.getCrackId();

          Image image = imageRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
            log.error("균열 작업별 목록 불러오기 실패: 이미지 없음 crackId: {}", currentCrackId);
            return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
          });

          Segment segment = segmentRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
            log.error("균열 작업별 목록 불러오기 실패: 세그먼트 없음 crackId: {}", currentCrackId);
            return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
          });

          Lidar lidar = lidarRepository.findByCrackCrackId(currentCrackId).orElseThrow(() -> {
            log.error("균열 작업별 목록 불러오기 실패: 라이더 없음 crackId: {}", currentCrackId);
            return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
          });

          return CrackResponseDto.from(crack, segment, lidar, image);
        }).collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  @Override
  public CrackResponseDto findCrackById(Long crackId, Long userId) {
    log.info("균열 상세 정보 불러오기. crackId:{}", crackId);

    Crack c = crackRepository.findById(crackId).orElseThrow(() -> {
      log.error("균열 상세 정보 불러오기 실패: 균열 없음 crackId:{}", crackId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    Image i = imageRepository.findByCrackCrackId(c.getCrackId()).orElseThrow(() -> {
      log.error("균열 상세 정보 불러오기 실패: 이미지 없음 crackId: {}", c.getCrackId());
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    Segment s = segmentRepository.findByCrackCrackId(c.getCrackId()).orElseThrow(() -> {
      log.error("균열 상세 정보 불러오기 실패: 세그먼트 없음 crackId: {}", c.getCrackId());
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    Lidar l = lidarRepository.findByCrackCrackId(c.getCrackId()).orElseThrow(() -> {
      log.error("균열 상세 정보 불러오기 실패: 라이더 없음 crackId: {}", c.getCrackId());
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.CRACK_NOT_FOUND);
    });

    log.info("균열 상세 정보 불러오기 성공: crackId: {}", crackId);
    return CrackResponseDto.from(c, s, l, i);
  }
}
