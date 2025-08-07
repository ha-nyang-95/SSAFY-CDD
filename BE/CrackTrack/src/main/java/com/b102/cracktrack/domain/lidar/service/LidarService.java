package com.b102.cracktrack.domain.lidar.service;

public interface LidarService {

  /**
   * 라이더 데이터 생성
   * @param taskId 작업 ID
   * @param fileName 파일명
   * @param crackId 균열 ID
   */
  void createLidar(Long taskId, String fileName, String crackId);

} 