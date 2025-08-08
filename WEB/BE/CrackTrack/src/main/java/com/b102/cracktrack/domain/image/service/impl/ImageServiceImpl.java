package com.b102.cracktrack.domain.image.service.impl;

import com.b102.cracktrack.domain.crack.entity.Crack;
import com.b102.cracktrack.domain.crack.repository.CrackRepository;
import com.b102.cracktrack.domain.image.entity.Image;
import com.b102.cracktrack.domain.image.repository.ImageRepository;
import com.b102.cracktrack.domain.image.service.ImageService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageServiceImpl implements ImageService {

  private final ImageRepository imageRepository;
  private final CrackRepository crackRepository;
  private final TaskRepository taskRepository;

  @Override
  @Transactional
  public void createImage(Long taskId, String s3Url, String crackId) {
    log.info("이미지 생성 시작 - taskId: {}, s3Url: {}, crackId: {}", taskId, s3Url, crackId);
    
    // crackId를 통해 Crack 엔티티 찾기 (없으면 생성)
    Crack crack = crackRepository.findByTaskTaskIdAndCrackIdString(taskId, crackId)
        .orElseGet(() -> {
          log.info("Crack이 존재하지 않아 새로 생성합니다 - taskId: {}, crackId: {}", taskId, crackId);
          return createNewCrack(taskId, crackId);
        });
    
    Image image = Image.builder()
        .crack(crack)
        .s3Url(s3Url)  // 실제 S3 URL 사용
        .build();
    
    imageRepository.save(image);
    
    log.info("이미지 생성 완료 - imageId: {}", image.getImageId());
  }

  /**
   * 새로운 Crack 엔티티를 생성합니다.
   * 
   * @param taskId 작업 ID
   * @param crackIdString 크랙 ID 문자열 (예: crackId001)
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