package com.teto.cracktrack.common.exception;

import com.teto.cracktrack.common.util.ApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResult<Void>> handleApiException(ApiException e) {
    log.error("APIEXCEPTION 발생: {}", e.getMessage(), e);
    return ResponseEntity.ok(ApiResult.fail(e.getCode(), e.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResult<Void>> handleOtherException(Exception e) {
    log.error("처리하지 않은 에러 {} 발생: {}", e.getClass().getName(), e.getMessage(), e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResult.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), "내부 에러, 잠시 후 다시 시도해보세요."));
  }

}
