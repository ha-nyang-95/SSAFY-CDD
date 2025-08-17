package com.b102.cracktrack.common.exception;

public class ErrorMessage {

  // 400 Bad Request 
  public static final String BAD_REQUEST = "요청 파라미터가 올바르지 않습니다.";
  
  // 401 Unauthorized 
  public static final String UNAUTHORIZED = "인증이 필요합니다.";
  
  // 403 Forbidden 
  public static final String FORBIDDEN = "권한이 없습니다.";
  public static final String ACCESS_DENIED = "접근 권한이 없습니다.";
  
  // 500 Internal Server Error 
  public static final String INTERNAL_SERVER_ERROR = "알 수 없는 서버 오류가 발생했습니다.";

  // 도메인별 NOT_FOUND 에러 메시지 (404)  
  public static final String USER_NOT_FOUND = "해당 유저를 찾을 수 없습니다.";
  public static final String TASK_NOT_FOUND = "해당 작업을 찾을 수 없습니다.";
  public static final String LOCATION_NOT_FOUND = "해당 지역을 찾을 수 없습니다.";
  public static final String DISTRICT_NOT_FOUND = "해당 구역을 찾을 수 없습니다.";
  public static final String DETECTION_NOT_FOUND = "해당 디텍션을 찾을 수 없습니다.";
  public static final String CRACK_NOT_FOUND = "해당 균열을 찾을 수 없습니다.";
  public static final String MODELING_NOT_FOUND = "해당 모델링이 없습니다.";
  public static final String VIDEO_NOT_FOUND = "해당 비디오가 없습니다.";

  
  // Location 관련 
  public static final String DEFAULT_LOCATION_DELETE_FORBIDDEN = "기본 location은 삭제할 수 없습니다.";
}
