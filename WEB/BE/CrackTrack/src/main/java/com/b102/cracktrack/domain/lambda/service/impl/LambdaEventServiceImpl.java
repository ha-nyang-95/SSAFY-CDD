package com.b102.cracktrack.domain.lambda.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.image.service.ImageService;
import com.b102.cracktrack.domain.lambda.dto.LambdaEventRequestDto;
import com.b102.cracktrack.domain.lambda.service.LambdaEventService;
import com.b102.cracktrack.domain.lidar.service.LidarService;
import com.b102.cracktrack.domain.modeling.service.ModelingService;
import com.b102.cracktrack.domain.segment.service.SegmentService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.task.service.TaskService;
import com.b102.cracktrack.domain.video.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LambdaEventServiceImpl implements LambdaEventService {

  private final DetectionService detectionService;
  private final TaskRepository taskRepository;
  private final VideoService videoService;
  private final ModelingService modelingService;
  private final ImageService imageService;
  private final LidarService lidarService;
  private final SegmentService segmentService;
  private final TaskService taskService;


  @Override
  @Transactional  // 전체 파일 처리를 하나의 트랜잭션으로 묶기
  public void processEvent(LambdaEventRequestDto requestDto) {
    log.info("Lambda 이벤트 처리 시작 - uuid: {}, ccnt: {}",
        requestDto.getUuid(), requestDto.getCcnt());

    try {
      // UUID로 Task 조회 (전체 경로 사용)
      String fullPath = requestDto.getUuid();
      Task task = taskRepository.findByS3Name(fullPath)
          .orElseThrow(() -> {
            log.error("Task를 찾을 수 없음 - uuid: {}", fullPath);
            return new ApiException(HttpStatus.NOT_FOUND.value(), "해당 작업을 찾을 수 없습니다.");
          });

      log.info("Task 조회 성공 - taskId: {}, userId: {}", task.getTaskId(), task.getUser().getUserId());

      // 기본 비디오/모델링/디텍팅 파일 생성
      createSingleAssets(task);

      // 균열(ccnt) 개수만큼 이미지/세그먼트/라이더 생성
      Integer crackCount = requestDto.getCcnt();
      if (crackCount == null || crackCount < 0) {
        log.warn("ccnt가 유효하지 않음: {}. 0으로 간주합니다.", crackCount);
        crackCount = 0;
      }
      createCrackAssets(task, crackCount);
      
      taskService.completeTask(requestDto.getUuid());

      log.info("Lambda 이벤트 처리 성공 - uuid: {}, taskId: {}", 
          requestDto.getUuid(), task.getTaskId());

    } catch (Exception e) {
      log.error("Lambda 이벤트 처리 실패 - uuid: {}, error: {}", 
          requestDto.getUuid(), e.getMessage());
      throw e;
    }
  }

  private void createSingleAssets(Task task) {
    // 비디오
    String videoKey = task.getS3Name() + "/video.mp4";
    log.info("비디오 파일 생성 - S3 Key: {}", videoKey);
    videoService.createVideo(task.getTaskId(), videoKey);

    // 디텍팅
    String detectKey = task.getS3Name() + "/detect.mp4";
    log.info("디텍션 파일 생성 - S3 Key: {}", detectKey);
    detectionService.createDetection(task.getTaskId(), detectKey);

    // 모델링
    String modelingKey = task.getS3Name() + "/model.splat";
    log.info("모델링 파일 생성 - S3 Key: {}", modelingKey);
    modelingService.createModeling(task.getTaskId(), modelingKey);
  }

  private void createCrackAssets(Task task, int crackCount) {
    log.info("균열 관련 파일 생성 시작 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
    for (int i = 1; i <= crackCount; i++) {
      String crackIdString = String.format("crack_%03d", i); // 3자리 zero padding
      String basePath = task.getS3Name() + "/crack_num/" + crackIdString;

      // 세그먼트
      String segmentKey = basePath + "/segment.png";
      log.info("세그먼트 생성 - crackId: {}, S3 Key: {}", crackIdString, segmentKey);
      segmentService.createSegment(task.getTaskId(), segmentKey, crackIdString);

      // 이미지
      String imageKey = basePath + "/image.jpeg";
      log.info("이미지 생성 - crackId: {}, S3 Key: {}", crackIdString, imageKey);
      imageService.createImage(task.getTaskId(), imageKey, crackIdString);

      // 라이더
      String lidarKey = basePath + "/lidar.json";
      log.info("라이더 생성 - crackId: {}, S3 Key: {}", crackIdString, lidarKey);
      lidarService.createLidar(task.getTaskId(), lidarKey, crackIdString);
    }
    log.info("균열 관련 파일 생성 완료");
  }
} 