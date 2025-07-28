package com.teto.cracktrack.common.exception;

public class ApiException extends RuntimeException {

  private final int code;
  private final String message;

  public ApiException(int code, String message) {
    super(message);
    this.code = code;
    this.message = message;
  }

  public int getCode() { return code; }

  @Override
  public String getMessage() { return message; }

  public static ApiException of(int code, String message) {
    return new ApiException(code, message);
  }
}
