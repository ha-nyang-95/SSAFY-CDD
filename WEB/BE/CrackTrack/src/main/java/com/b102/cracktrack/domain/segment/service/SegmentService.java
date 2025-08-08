package com.b102.cracktrack.domain.segment.service;

public interface SegmentService {

  /**
   * 세그먼트 데이터 생성
   * @param taskId 작업 ID
   * @param s3Url S3 URL
   * @param crackId 균열 ID
   */
  void createSegment(Long taskId, String s3Url, String crackId);

} 