package com.b102.cracktrack.domain.image.service.impl;

import com.b102.cracktrack.common.service.FileProcessingService;
import com.b102.cracktrack.domain.crack.entity.Crack;
import com.b102.cracktrack.domain.crack.repository.CrackRepository;
import com.b102.cracktrack.domain.image.entity.Image;
import com.b102.cracktrack.domain.image.repository.ImageRepository;
import com.b102.cracktrack.domain.image.service.ImageService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageServiceImpl implements ImageService {

  private final ImageRepository imageRepository;
  private final CrackRepository crackRepository;
  private final TaskRepository taskRepository;
  private final FileProcessingService fileProcessingService;

  @Value("${cloud.aws.s3.bucket}")
  private String s3Bucket;

  @Value("${cloud.aws.region.static}")
  private String awsRegion;

  @Override
  @Transactional
  public void createImage(Long taskId, String fileName, String crackId) {
    log.info("이미지 생성 시작 - taskId: {}, fileName: {}, crackId: {}", taskId, fileName, crackId);
    
    // crackId를 통해 Crack 엔티티 찾기 (없으면 생성)
    Crack crack = crackRepository.findByTaskTaskIdAndCrackIdString(taskId, crackId)
        .orElseGet(() -> {
          log.info("Crack이 존재하지 않아 새로 생성합니다 - taskId: {}, crackId: {}", taskId, crackId);
          return createNewCrack(taskId, crackId);
        });
    
    // FileProcessingService를 사용하여 S3 URL 생성
    String s3Url = fileProcessingService.generateS3Url(crack.getTask().getS3Name(), fileName);
    
    if (s3Url == null) {
      log.error("S3 URL 생성 실패 - taskId: {}, fileName: {}", taskId, fileName);
      throw new RuntimeException("S3 URL 생성에 실패했습니다.");
    }
    
    Image image = Image.builder()
        .crack(crack)
        .s3Url(s3Url)
        .build();
    
    imageRepository.save(image);
    
    log.info("이미지 생성 완료 - imageId: {}, S3 URL: {}", image.getImageId(), s3Url);
  }

  /**
   * 새로운 Crack 엔티티를 생성합니다.
   * 
   * @param taskId 작업 ID
   * @param crackIdString 크랙 ID 문자열 (예: crack_001, crack_002)
   * @return 생성된 Crack 엔티티
   */
  private Crack createNewCrack(Long taskId, String crackIdString) {
    // Task 엔티티 조회 (Crack 생성에 필요)
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: taskId=" + taskId));
    
    Crack crack = Crack.builder()
        .task(task)
        .crackIdString(crackIdString)
        .build();
    
    return crackRepository.save(crack);
  }
} 