package com.b102.cracktrack.domain.lambda.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.service.FileProcessingService;
import com.b102.cracktrack.domain.lambda.dto.LambdaEventRequestDto;
import com.b102.cracktrack.domain.lambda.service.LambdaEventService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.task.service.TaskService;
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
      fileProcessingService.createBasicAssets(task);
      fileProcessingService.createCrackAssets(task, requestDto.getCcnt());
      
      taskService.completeTask(requestDto.getUuid());

      log.info("Lambda 이벤트 처리 성공 - uuid: {}, taskId: {}", 
          requestDto.getUuid(), task.getTaskId());

    } catch (Exception e) {
      log.error("Lambda 이벤트 처리 실패 - uuid: {}, error: {}", 
          requestDto.getUuid(), e.getMessage());
      throw e;
    }
  }


} 