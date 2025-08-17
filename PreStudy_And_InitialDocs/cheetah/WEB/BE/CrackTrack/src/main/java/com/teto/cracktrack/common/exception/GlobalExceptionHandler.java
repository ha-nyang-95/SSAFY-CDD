package com.teto.cracktrack.common.exception;

import com.teto.cracktrack.common.util.ApiResult;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * @Valid 어노테이션으로 유효성 검증 실패 시 발생하는 예외 처리
   * 주로 @RequestBody에 대한 유효성 검증 실패
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResult<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
    log.warn("[Validation Error] 입력값 유효성 검증 실패: {}", e.getMessage());
    
    List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
    String errorMessage = fieldErrors.isEmpty() 
        ? "입력값이 올바르지 않습니다." 
        : fieldErrors.get(0).getDefaultMessage(); // 첫 번째 에러 메시지 사용
    
    return ResponseEntity.badRequest()
        .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), errorMessage));
  }

  /**
   * 데이터 바인딩 에러 처리
   */
  @ExceptionHandler(BindException.class)
  public ResponseEntity<ApiResult<Void>> handleBindException(BindException e) {
    log.warn("[Binding Error] 데이터 바인딩 실패: {}", e.getMessage());
    
    List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
    String errorMessage = fieldErrors.isEmpty() 
        ? "입력 데이터 형식이 올바르지 않습니다." 
        : fieldErrors.get(0).getDefaultMessage();
    
    return ResponseEntity.badRequest()
        .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), errorMessage));
  }

  /**
   * Bean Validation 제약조건 위반 예외 처리
   */
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResult<Void>> handleConstraintViolationException(ConstraintViolationException e) {
    log.warn("[Constraint Violation] 제약조건 위반: {}", e.getMessage());
    
    String errorMessage = e.getConstraintViolations().isEmpty() 
        ? "입력값 제약조건을 위반했습니다." 
        : e.getConstraintViolations().iterator().next().getMessage();
    
    return ResponseEntity.badRequest()
        .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), errorMessage));
  }

  /**
   * IllegalArgumentException 처리 (비즈니스 로직 에러)
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiResult<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
    log.warn("[Business Logic Error] 비즈니스 로직 에러: {}", e.getMessage());
    return ResponseEntity.badRequest()
        .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
  }

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
