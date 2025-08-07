package com.b102.cracktrack.domain.lambda.service;

import com.b102.cracktrack.domain.lambda.dto.LambdaEventRequestDto;

public interface LambdaEventService {
  
  /**
   * Lambda 이벤트를 처리하고 해당하는 엔티티를 생성합니다.
   * 
   * @param requestDto Lambda 이벤트 요청 데이터
   */
  void processEvent(LambdaEventRequestDto requestDto);
  
}
