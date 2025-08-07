package com.b102.cracktrack.domain.lambda.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LambdaEventRequestDto {
  
  private String uuid;              // 작업 생성 시 알려준 UUID (s3Name)
  private List<String> files;       // 처리된 파일 리스트
  private String metadata;          // 추가 메타데이터 (JSON 형태)
  
} 