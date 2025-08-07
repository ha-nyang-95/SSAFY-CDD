package com.b102.cracktrack.domain.video.service;

public interface VideoService {

  /**
   * 비디오 생성
   * @param taskId 작업 ID
   * @param fileName 파일명
   */
  void createVideo(Long taskId, String fileName);

}
