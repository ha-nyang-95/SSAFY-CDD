package com.b102.cracktrack.domain.lambda.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LambdaEventRequestDto {
  
  private String uuid;   // 작업 생성 시 알려준 UUID (s3Name)
  private Integer ccnt;  // 균열 개수
  
} 