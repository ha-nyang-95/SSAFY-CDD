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

      // ccnt 기반으로 기본 파일들 생성 (정해진 URL 패턴)
      createDefaultFiles(task, requestDto.getCcnt());
      
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

  /**
   * ccnt 기반으로 기본 파일들을 생성합니다.
   * 정해진 URL 패턴으로 비디오, 디텍션, 모델링, 균열별 이미지/세그먼트/라이더 파일을 생성합니다.
   * 
   * @param task 작업 정보
   * @param crackCount 균열 개수
   */
  private void createDefaultFiles(Task task, Integer crackCount) {
    if (crackCount == null || crackCount < 0) {
      log.warn("ccnt가 유효하지 않음: {}. 0으로 간주합니다.", crackCount);
      crackCount = 0;
    }
    
    log.info("기본 파일 생성 시작 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
    
    // 1. 기본 파일들 생성 (비디오, 디텍션, 모델링)
    createBasicAssets(task);
    
    // 2. 균열별 파일들 생성 (이미지, 세그먼트, 라이더)
    createCrackAssets(task, crackCount);
    
    log.info("기본 파일 생성 완료 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
  }

  /**
   * 기본 자산 파일들을 생성합니다 (비디오, 디텍션, 모델링)
   */
  private void createBasicAssets(Task task) {
    // 비디오 파일 생성
    String videoFileName = "raw_video.mp4";
    String videoS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), videoFileName);
    log.info("비디오 파일 생성 - S3 URL: {}", videoS3Url);
    videoService.createVideo(task.getTaskId(), videoS3Url);
    
    // 디텍션 파일 생성
    String detectionFileName = "detected_video.mp4";
    String detectionS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), detectionFileName);
    log.info("디텍션 파일 생성 - S3 URL: {}", detectionS3Url);
    detectionService.createDetection(task.getTaskId(), detectionS3Url);
    
    // 모델링 파일 생성
    String modelingFileName = "modeling.obj";
    String modelingS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), modelingFileName);
    log.info("모델링 파일 생성 - S3 URL: {}", modelingS3Url);
    modelingService.createModeling(task.getTaskId(), modelingS3Url);
  }

  /**
   * 균열별 파일들을 생성합니다 (이미지, 세그먼트, 라이더)
   */
  private void createCrackAssets(Task task, int crackCount) {
    log.info("균열 관련 파일 생성 시작 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
    
    for (int i = 1; i <= crackCount; i++) {
      String crackIdString = String.format("crack_%03d", i); // 3자리 zero padding (crack_001, crack_002, ...)
      
      // 세그먼트 파일 생성
      String segmentFileName = crackIdString + "/segment.png";
      String segmentS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), segmentFileName);
      log.info("세그먼트 생성 - crackId: {}, S3 URL: {}", crackIdString, segmentS3Url);
      segmentService.createSegment(task.getTaskId(), segmentS3Url, crackIdString);
      
      // 이미지 파일 생성
      String imageFileName = crackIdString + "/image.jpeg";
      String imageS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), imageFileName);
      log.info("이미지 생성 - crackId: {}, S3 URL: {}", crackIdString, imageS3Url);
      imageService.createImage(task.getTaskId(), imageS3Url, crackIdString);
      
      // 라이더 파일 생성
      String lidarFileName = crackIdString + "/lidar.json";
      String lidarS3Url = FileTypeParser.generateS3PublicUrl(bucketName, task.getS3Name(), lidarFileName);
      log.info("라이더 생성 - crackId: {}, S3 URL: {}", crackIdString, lidarS3Url);
      lidarService.createLidar(task.getTaskId(), lidarS3Url, crackIdString);
    }
    
    log.info("균열 관련 파일 생성 완료 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
  }
} 