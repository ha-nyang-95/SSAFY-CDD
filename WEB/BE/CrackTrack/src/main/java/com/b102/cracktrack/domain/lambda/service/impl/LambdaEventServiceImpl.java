package com.b102.cracktrack.domain.lambda.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.service.FileProcessingService;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LambdaEventServiceImpl implements LambdaEventService {

  private final TaskRepository taskRepository;
  private final TaskService taskService;
  private final FileProcessingService fileProcessingService;
  private final VideoService videoService;
  private final DetectionService detectionService;
  private final ModelingService modelingService;
  private final SegmentService segmentService;
  private final ImageService imageService;
  private final LidarService lidarService;

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

      // FileProcessingService를 사용하여 S3 URL 생성
      List<String> s3Urls = fileProcessingService.generateS3Urls(requestDto.getUuid(), requestDto.getCcnt());
      
      // 생성된 URL들을 각 도메인 서비스로 저장
      saveUrlsToServices(task, s3Urls, requestDto.getCcnt());
      
      taskService.completeTask(requestDto.getUuid());

      log.info("Lambda 이벤트 처리 성공 - uuid: {}, taskId: {}", 
          requestDto.getUuid(), task.getTaskId());

    } catch (Exception e) {
      log.error("Lambda 이벤트 처리 실패 - uuid: {}, error: {}", 
          requestDto.getUuid(), e.getMessage());
      throw e;
    }
  }

  /**
   * 생성된 S3 URL들을 각 도메인 서비스로 저장합니다.
   * 
   * @param task 작업 정보
   * @param s3Urls 생성된 S3 URL 목록
   * @param crackCount 균열 개수
   */
  private void saveUrlsToServices(Task task, List<String> s3Urls, int crackCount) {
    log.info("URL 저장 시작 - taskId: {}, 총 URL 개수: {}", task.getTaskId(), s3Urls.size());
    
    try {
      // 기본 자산 저장 (처음 3개: raw_video.mp4, detect.mp4, model.splat)
      videoService.createVideo(task.getTaskId(), "raw_video.mp4");
      detectionService.createDetection(task.getTaskId(), "detect.mp4");
      modelingService.createModeling(task.getTaskId(), "model.splat");
      
      // 균열별 자산 저장 (나머지 URL들)
      int baseUrlCount = 3; // 기본 자산 3개
      int crackAssetCount = crackCount * 3; // 균열당 3개 (segment, image, lidar)
      
      for (int i = 0; i < crackCount; i++) {
        String crackId = String.format("crack_%03d", i + 1);
        
        // segment.png
        segmentService.createSegment(task.getTaskId(), "crack_num/" + crackId + "/segment.png", crackId);
        
        // image.jpeg
        imageService.createImage(task.getTaskId(), "crack_num/" + crackId + "/image.jpeg", crackId);
        
        // lidar.json
        lidarService.createLidar(task.getTaskId(), "crack_num/" + crackId + "/lidar.json", crackId);
      }
      
      log.info("URL 저장 완료 - taskId: {}, 기본 자산: 3개, 균열별 자산: {}개", 
          task.getTaskId(), crackCount * 3);
          
    } catch (Exception e) {
      log.error("URL 저장 실패 - taskId: {}, error: {}", task.getTaskId(), e.getMessage());
      throw e;
    }
  }
} 