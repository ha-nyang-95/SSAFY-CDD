package com.b102.cracktrack.domain.detection.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.common.util.FileTypeParser;
import com.b102.cracktrack.domain.detection.dto.DetectionResponseDto;
import com.b102.cracktrack.domain.detection.entity.Detection;
import com.b102.cracktrack.domain.detection.repository.DetectionRepository;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DetectionServiceImpl implements DetectionService {

  private final DetectionRepository detectionRepository;
  private final TaskRepository taskRepository;
  private final UserRepository userRepository;

  @Value("${cloud.aws.s3.bucket}")
  private String s3Bucket;

  @Value("${cloud.aws.region.static}")
  private String awsRegion;

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
      log.debug("작업별 디텍션 조회 중 - taskId: {}, districtId: {}", task.getTaskId(),
          task.getDistrict() == null ? null : task.getDistrict().getDistrictId());

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
  public List<DetectionResponseDto> findAllByDistrictId(Long districtId, Long userId) {
    log.info("Detection 구역별 작업 목록 조회 시작 - districtId: {}, userId: {}", districtId, userId);

    List<Task> tasks = taskRepository.findByDistrictDistrictId(districtId);
    List<DetectionResponseDto> result = new ArrayList<>();
    for (Task task : tasks) {
      detectionRepository.findByTaskTaskId(task.getTaskId())
          .ifPresent(d -> result.add(DetectionResponseDto.from(d)));
    }
    return result;
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

  @Override
  @Transactional
  public void createDetection(Long taskId, String fileName) {
    log.info("디텍션 생성 시작 - taskId: {}, fileName: {}", taskId, fileName);
    
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: " + taskId));
    
    // FileTypeParser를 사용하여 일관된 S3 URL 생성
    String s3Url = FileTypeParser.generateS3PublicUrl(s3Bucket, task.getS3Name(), fileName);
    
    if (s3Url == null) {
      log.error("S3 URL 생성 실패 - taskId: {}, fileName: {}", taskId, fileName);
      throw new RuntimeException("S3 URL 생성에 실패했습니다.");
    }
    
    Detection detection = Detection.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    detectionRepository.save(detection);
    
    log.info("디텍션 생성 완료 - detectionId: {}, S3 URL: {}", detection.getDetectionId(), s3Url);
  }
}
