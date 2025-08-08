package com.b102.cracktrack.domain.lidar.service;

public interface LidarService {

  /**
   * 라이더 데이터 생성
   * @param taskId 작업 ID
   * @param s3Url S3 URL
   * @param crackId 균열 ID
   */
  void createLidar(Long taskId, String s3Url, String crackId);

} 