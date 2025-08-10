package com.b102.cracktrack.domain.lambda.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.image.service.ImageService;
import com.b102.cracktrack.domain.lambda.dto.LambdaEventRequestDto;
import com.b102.cracktrack.domain.lambda.service.LambdaEventService;
import com.b102.cracktrack.common.util.FileTypeParser;
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

  private final DetectionService detectionService;
  private final TaskRepository taskRepository;
  private final VideoService videoService;
  private final ModelingService modelingService;
  private final ImageService imageService;
  private final LidarService lidarService;
  private final SegmentService segmentService;
  private final TaskService taskService;

  @Value("${cloud.aws.s3.bucket}")
  private String bucketName;

  @Override
  @Transactional  // 전체 파일 처리를 하나의 트랜잭션으로 묶기
  public void processEvent(LambdaEventRequestDto requestDto) {
    log.info("Lambda 이벤트 처리 시작 - uuid: {}, 파일 개수: {}", 
        requestDto.getUuid(), requestDto.getFiles().size());

    try {
      // UUID로 Task 조회 (전체 경로 사용)
      String fullPath = requestDto.getUuid();
      Task task = taskRepository.findByS3Name(fullPath)
          .orElseThrow(() -> {
            log.error("Task를 찾을 수 없음 - uuid: {}", fullPath);
            return new ApiException(HttpStatus.NOT_FOUND.value(), "해당 작업을 찾을 수 없습니다.");
          });

      log.info("Task 조회 성공 - taskId: {}, userId: {}", task.getTaskId(), task.getUser().getUserId());

      // 파일들을 타입별로 분류
      Map<String, List<String>> filesByType = requestDto.getFiles().stream()
          .collect(Collectors.groupingBy(FileTypeParser::parseFileType));

      log.info("파일 분류 완료 - {}", filesByType);

      // 각 타입별로 엔티티 생성 (S3 URL과 함께)
      processFilesByType(task, filesByType);
      
      taskService.completeTask(requestDto.getUuid());

      log.info("Lambda 이벤트 처리 성공 - uuid: {}, taskId: {}", 
          requestDto.getUuid(), task.getTaskId());

    } catch (Exception e) {
      log.error("Lambda 이벤트 처리 실패 - uuid: {}, error: {}", 
          requestDto.getUuid(), e.getMessage());
      throw e;
    }
  }

  private void processFilesByType(Task task, Map<String, List<String>> filesByType) {
    // 비디오 파일 처리
    if (filesByType.containsKey("VIDEO")) {
      processVideoFiles(task, filesByType.get("VIDEO"));
    }

    // 디텍션 파일 처리
    if (filesByType.containsKey("DETECTION")) {
      processDetectionFiles(task, filesByType.get("DETECTION"));
    }

    // 모델링 파일 처리
    if (filesByType.containsKey("MODELING")) {
      processModelingFiles(task, filesByType.get("MODELING"));
    }

    // 세그먼트 파일 처리
    if (filesByType.containsKey("SEGMENT")) {
      processSegmentFiles(task, filesByType.get("SEGMENT"));
    }

    // 이미지 파일 처리
    if (filesByType.containsKey("IMAGE")) {
      processImageFiles(task, filesByType.get("IMAGE"));
    }

    // 라이더 파일 처리
    if (filesByType.containsKey("LIDAR")) {
      processLidarFiles(task, filesByType.get("LIDAR"));
    }

    // 알 수 없는 파일 타입 로깅
    if (filesByType.containsKey("UNKNOWN")) {
      log.warn("알 수 없는 파일 타입들: {}", filesByType.get("UNKNOWN"));
    }
  }

  private void processVideoFiles(Task task, List<String> videoFiles) {
    log.info("비디오 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), videoFiles.size());
    
    for (String fileName : videoFiles) {
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("비디오 파일 처리 중: {}, S3 URL: {}", fileName, s3Url);
      videoService.createVideo(task.getTaskId(), s3Url);
    }
    
    log.info("비디오 파일 처리 완료");
  }

  private void processDetectionFiles(Task task, List<String> detectionFiles) {
    log.info("디텍션 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), detectionFiles.size());
    
    for (String fileName : detectionFiles) {
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("디텍션 파일 처리 중: {}, S3 URL: {}", fileName, s3Url);
      detectionService.createDetection(task.getTaskId(), s3Url);
    }
    
    log.info("디텍션 파일 처리 완료");
  }

  private void processModelingFiles(Task task, List<String> modelingFiles) {
    log.info("모델링 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), modelingFiles.size());
    
    for (String fileName : modelingFiles) {
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("모델링 파일 처리 중: {}, S3 URL: {}", fileName, s3Url);
      modelingService.createModeling(task.getTaskId(), s3Url);
    }
    
    log.info("모델링 파일 처리 완료");
  }

  private void processSegmentFiles(Task task, List<String> segmentFiles) {
    log.info("세그먼트 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), segmentFiles.size());
    
    for (String fileName : segmentFiles) {
      String crackId = FileTypeParser.extractCrackId(fileName);
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("세그먼트 파일 처리 중: {}, crackId: {}, S3 URL: {}", fileName, crackId, s3Url);
      segmentService.createSegment(task.getTaskId(), s3Url, crackId);
    }
    
    log.info("세그먼트 파일 처리 완료");
  }

  private void processImageFiles(Task task, List<String> imageFiles) {
    log.info("이미지 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), imageFiles.size());
    
    for (String fileName : imageFiles) {
      String crackId = FileTypeParser.extractCrackId(fileName);
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("이미지 파일 처리 중: {}, crackId: {}, S3 URL: {}", fileName, crackId, s3Url);
      imageService.createImage(task.getTaskId(), s3Url, crackId);
    }
    
    log.info("이미지 파일 처리 완료");
  }

  private void processLidarFiles(Task task, List<String> lidarFiles) {
    log.info("라이더 파일 처리 시작 - taskId: {}, 파일 개수: {}", task.getTaskId(), lidarFiles.size());
    
    for (String fileName : lidarFiles) {
      String crackId = FileTypeParser.extractCrackId(fileName);
      String s3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), fileName);
      log.info("라이더 파일 처리 중: {}, crackId: {}, S3 URL: {}", fileName, crackId, s3Url);
      lidarService.createLidar(task.getTaskId(), s3Url, crackId);
    }
    
    log.info("라이더 파일 처리 완료");
  }
} 