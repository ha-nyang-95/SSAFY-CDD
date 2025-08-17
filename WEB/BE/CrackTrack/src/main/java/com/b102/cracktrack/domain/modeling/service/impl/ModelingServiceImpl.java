package com.b102.cracktrack.domain.modeling.service.impl;

import com.b102.cracktrack.common.util.FileTypeParser;
import com.b102.cracktrack.domain.modeling.entity.Modeling;
import com.b102.cracktrack.domain.modeling.repository.ModelingRepository;
import com.b102.cracktrack.domain.modeling.service.ModelingService;
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
public class ModelingServiceImpl implements ModelingService {

  private final ModelingRepository modelingRepository;
  private final TaskRepository taskRepository;

  @Value("${cloud.aws.s3.bucket}")
  private String s3Bucket;

  @Value("${cloud.aws.region.static}")
  private String awsRegion;

  @Override
  @Transactional
  public void createModeling(Long taskId, String fileName) {
    log.info("모델링 데이터 생성 시작 - taskId: {}, fileName: {}", taskId, fileName);
    
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: " + taskId));
    
    // FileTypeParser를 사용하여 일관된 S3 URL 생성
    String s3Url = FileTypeParser.generateS3PublicUrl(s3Bucket, task.getS3Name(), fileName);
    
    if (s3Url == null) {
      log.error("S3 URL 생성 실패 - taskId: {}, fileName: {}", taskId, fileName);
      throw new RuntimeException("S3 URL 생성에 실패했습니다.");
    }
    
    Modeling modeling = Modeling.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    modelingRepository.save(modeling);
    
    log.info("모델링 데이터 생성 완료 - modelingId: {}, S3 URL: {}", modeling.getModelingId(), s3Url);
  }
} 