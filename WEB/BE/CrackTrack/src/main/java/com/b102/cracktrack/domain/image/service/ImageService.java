package com.b102.cracktrack.domain.image.service;

public interface ImageService {

  /**
   * 이미지 생성
   * @param taskId 작업 ID
   * @param s3Url S3 URL
   * @param crackId 균열 ID
   */
  void createImage(Long taskId, String s3Url, String crackId);

} 