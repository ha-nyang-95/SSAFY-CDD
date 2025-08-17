package com.b102.cracktrack.domain.lambda.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.lambda.dto.LambdaEventRequestDto;
import com.b102.cracktrack.domain.lambda.service.LambdaEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "AWS LAMBDA")
@RestController
@RequestMapping("/api/lambda")
@RequiredArgsConstructor
@Slf4j
public class LambdaController {

  private final LambdaEventService lambdaEventService;

  @Operation(summary = "Lambda 이벤트 처리", description = "AWS Lambda에서 전송된 이벤트를 처리합니다.")
  @PostMapping("/event")
  public ResponseEntity<ApiResult<Void>> handleLambdaEvent(
      @RequestBody LambdaEventRequestDto requestDto) {
    
    log.info("Lambda 이벤트 수신 - uuid: {}, ccnt: {}", 
        requestDto.getUuid(), requestDto.getCcnt());
    
    // 이벤트 처리 (응답은 신경쓰지 않음)
    lambdaEventService.processEvent(requestDto);
    
    log.info("Lambda 이벤트 처리 완료 - uuid: {}", requestDto.getUuid());
    
    return ResponseEntity.ok(ApiResult.success(200, "이벤트 처리 완료", null));
  }
} 