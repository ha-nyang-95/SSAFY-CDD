package com.b102.cracktrack.domain.modeling.service;

public interface ModelingService {

  /**
   * 모델링 데이터 생성
   * @param taskId 작업 ID
   * @param fileName 파일명
   */
  void createModeling(Long taskId, String fileName);

} 