package com.b102.cracktrack.common.exception;

import com.b102.cracktrack.common.util.ApiResult;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * @Valid, @Validated 어노테이션으로 유효성 검증 실패 시 발생하는 예외 처리
     */
    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<ApiResult<Void>> handleValidationExceptions(BindException e) {
        log.warn("[Validation Error] 입력값 유효성 검증 실패: {}", e.getMessage());
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getDefaultMessage())
                .findFirst()
                .orElse(ErrorMessage.BAD_REQUEST);
        return ResponseEntity.badRequest()
                .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), errorMessage));
    }

    /**
     * Bean Validation 제약조건 위반 예외 처리
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResult<Void>> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("[Constraint Violation] 제약조건 위반: {}", e.getMessage());
        String errorMessage = e.getConstraintViolations().stream()
                .map(cv -> cv.getMessage())
                .findFirst()
                .orElse(ErrorMessage.BAD_REQUEST);
        return ResponseEntity.badRequest()
                .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), errorMessage));
    }

    /**
     * 비즈니스 로직 상 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResult<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("[Business Logic Error] {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResult.fail(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
    }

    /**
     * 커스텀 API 예외 처리
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResult<Void>> handleApiException(ApiException e) {
        log.error("API Exception: code={}, message={}", e.getCode(), e.getMessage());
        return ResponseEntity
                .status(e.getCode())
                .body(ApiResult.fail(e.getCode(), e.getMessage()));
    }

    /**
     * 그 외 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<Void>> handleAllUncaughtException(Exception e) {
        log.error("Unhandled Exception occurred: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()
                .body(ApiResult.fail(HttpStatus.INTERNAL_SERVER_ERROR.value(), ErrorMessage.INTERNAL_SERVER_ERROR));
    }
}
