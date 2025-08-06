package com.b102.cracktrack.domain.detection.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.detection.dto.DetectionResponseDto;
import com.b102.cracktrack.domain.detection.repository.DetectionRepository;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.location.repository.LocationRepository;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import com.b102.cracktrack.domain.detection.entity.Detection;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DetectionServiceImpl implements DetectionService {

  private final DetectionRepository detectionRepository;
  private final TaskRepository taskRepository;
  private final LocationRepository locationRepository;
  private final UserRepository userRepository;

  @Override
  public List<DetectionResponseDto> findAllByUserId(Long userId) {

    log.info("Detection 유저 작업 목록 조회 시작 - userId: {}", userId);

    // 유저의 모든 작업 조회
    List<Task> tasks = taskRepository.findByUserUserId(userId);
    log.info("유저 작업 조회 완료 - userId: {}, 작업 개수: {}", userId, tasks.size());

    if (tasks.isEmpty()) {
      log.error("Detection 유저 작업 목록 조회 실패: 작업없음. userId: {}", userId);
      throw new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    }

    // 각 작업에 해당하는 디텍션을 찾아서 리스트로 반환
    List<DetectionResponseDto> detections = new ArrayList<>();
    log.info("디텍션 조회 시작 - 총 작업 개수: {}", tasks.size());

    for (Task task : tasks) {
      log.debug("작업별 디텍션 조회 중 - taskId: {}, locationId: {}", task.getTaskId(),
          task.getLocationId());

      // 각 작업에 해당하는 디텍션 조회 (Optional 사용)
      detectionRepository.findByTaskTaskId(task.getTaskId())
          .ifPresentOrElse(
              detection -> {
                log.debug("디텍션 발견 - taskId: {}, detectionId: {}, s3Url: {}",
                    task.getTaskId(), detection.getDetectionId(), detection.getS3Url());
                detections.add(DetectionResponseDto.from(detection));
              },
              () -> log.debug("디텍션 없음 - taskId: {}", task.getTaskId())
          );
    }

    log.info("Detection 유저 작업 목록 조회 완료 - userId: {}, 총 디텍션 개수: {}", userId, detections.size());
    return detections;
  }

  @Override
  public List<DetectionResponseDto> findAllByLocationId(Long locationId, Long userId) {
    log.info("Detection 지역별 작업 목록 조회 시작 - locationId: {}, userId: {}", locationId, userId);


    return List.of();
  }

  @Override
  public void deleteDetection(Long detectionId) {
    log.info("Detection 삭제 시작 - detectionId: {}", detectionId);

  }

  @Override
  public DetectionResponseDto findById(Long detectionId, Long userId) {
    log.info("Detection 상세 조회 시작 - detectionId: {}, userId: {}", detectionId, userId);
    
    // 디텍션 조회
    Detection detection = detectionRepository.findById(detectionId).orElseThrow(
        () -> new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.DETECTION_NOT_FOUND));

    // 권한 확인 (본인이 생성한 디텍션인지 확인 - task를 통해)
    if (!detection.getTask().getUser().getUserId().equals(userId)) {
      log.warn("Detection 상세 조회 실패: 유저권한 없음, userId: {}, detectionId: {}", userId, detectionId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.ACCESS_DENIED);
    }
    
    log.info("Detection 상세 조회 성공: detectionId: {}, userId: {}", detectionId, userId);
    return DetectionResponseDto.from(detection);
  }
}
