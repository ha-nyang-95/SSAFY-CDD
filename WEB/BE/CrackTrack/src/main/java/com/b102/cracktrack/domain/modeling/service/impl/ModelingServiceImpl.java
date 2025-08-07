package com.b102.cracktrack.domain.modeling.service.impl;

import com.b102.cracktrack.domain.modeling.entity.Modeling;
import com.b102.cracktrack.domain.modeling.repository.ModelingRepository;
import com.b102.cracktrack.domain.modeling.service.ModelingService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelingServiceImpl implements ModelingService {

  private final ModelingRepository modelingRepository;
  private final TaskRepository taskRepository;

  @Override
  @Transactional
  public void createModeling(Long taskId, String fileName) {
    log.info("모델링 데이터 생성 시작 - taskId: {}, fileName: {}", taskId, fileName);
    
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: " + taskId));
    
    // S3 URL 생성 (실제 구현에서는 S3 경로로 변경)
    String s3Url = "s3://cracktrack/" + fileName;
    
    Modeling modeling = Modeling.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    modelingRepository.save(modeling);
    
    log.info("모델링 데이터 생성 완료 - modelingId: {}", modeling.getModelingId());
  }
} 