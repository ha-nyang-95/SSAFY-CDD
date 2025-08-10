package com.b102.cracktrack.domain.image.service;

public interface ImageService {

  /**
   * 이미지 생성
   * @param taskId 작업 ID
   * @param fileName 파일명
   * @param crackId 균열 ID
   */
  void createImage(Long taskId, String fileName, String crackId);

} 