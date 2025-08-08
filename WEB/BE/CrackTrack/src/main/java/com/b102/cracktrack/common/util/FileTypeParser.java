package com.b102.cracktrack.common.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileTypeParser {

  /**
   * S3 파일명을 보고 엔티티 타입을 파싱합니다.
   * 
   * @param fileName 파일명 (예: raw_video001.mp4, detected_video001.mp4, modeling001.obj, crackId001/segment.jpg, crackId001/image.jpg, crackId001/lidar.json)
   * @return 엔티티 타입 (VIDEO, DETECTION, MODELING, SEGMENT, IMAGE, LIDAR)
   */
  public static String parseFileType(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      log.warn("파일명이 null이거나 비어있음: {}", fileName);
      return "UNKNOWN";
    }

    // 경로가 포함된 파일명인 경우 파일명만 추출
    String actualFileName = fileName;
    if (fileName.contains("/")) {
      String[] parts = fileName.split("/");
      actualFileName = parts[parts.length - 1]; // 마지막 부분이 실제 파일명
    }

    String lowerFileName = actualFileName.toLowerCase();
    
    // 원본 비디오 파일 (raw_video + datetime)
    if (lowerFileName.startsWith("raw_video")) {
      return "VIDEO";
    }
    
    // 탐지된 비디오 파일 (detected_video + datetime)
    if (lowerFileName.startsWith("detected_video")) {
      return "DETECTION";
    }
    
    // 모델링 파일 (Modeling + datetime)
    if (lowerFileName.startsWith("modeling")) {
      return "MODELING";
    }
    
    // 세그먼트 파일 (segment.jpeg, segment.jpg)
    if (lowerFileName.equals("segment.jpeg") || lowerFileName.equals("segment.jpg") ||
        lowerFileName.endsWith("/segment.jpeg") || lowerFileName.endsWith("/segment.jpg")) {
      return "SEGMENT";
    }
    
    // 이미지 파일 (image.jpeg, image.jpg)
    if (lowerFileName.equals("image.jpeg") || lowerFileName.equals("image.jpg") ||
        lowerFileName.endsWith("/image.jpeg") || lowerFileName.endsWith("/image.jpg")) {
      return "IMAGE";
    }
    
    // 라이더 파일 (lidar.json)
    if (lowerFileName.equals("lidar.json") || lowerFileName.endsWith("/lidar.json")) {
      return "LIDAR";
    }
    
    // 추가적인 확장자 기반 검사
    if (lowerFileName.endsWith(".json") && (lowerFileName.contains("lidar") || lowerFileName.contains("/lidar"))) {
      return "LIDAR";
    }
    
    log.warn("알 수 없는 파일 타입: {}", fileName);
    return "UNKNOWN";
  }

  /**
   * 파일명에서 crackId를 추출합니다.
   * 
   * @param fileName 파일명 (예: crackId001/image.jpeg, crackId001/segment.jpg)
   * @return crackId (예: crackId001, crackId002)
   */
  public static String extractCrackId(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      return null;
    }

    // crackId 폴더 내의 파일인 경우 crackId 추출
    if (fileName.contains("/")) {
      String[] parts = fileName.split("/");
      
      // crackId001/segment.jpg 형태인 경우
      if (parts.length >= 2 && parts[0].startsWith("crackId")) {
        return parts[0]; // crackId001, crackId002 등
      }
    }
    
    return null;
  }

  /**
   * 파일명에서 datetime을 추출합니다.
   * 
   * @param fileName 파일명 (예: raw_video20250806154500.mp4)
   * @return datetime (예: 20250806154500)
   */
  public static String extractDateTime(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      return null;
    }

    // 파일명에서 숫자 패턴 찾기 (8자리 날짜 + 6자리 시간)
    String pattern = "\\d{14}"; // 20250806154500 형태
    java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern);
    java.util.regex.Matcher matcher = regex.matcher(fileName);
    
    if (matcher.find()) {
      return matcher.group();
    }
    
    return null;
  }

  /**
   * Task S3 경로와 파일명으로 S3 public URL 생성
   * 
   * @param bucketName S3 버킷명
   * @param taskS3Path Task의 S3 경로 (예: u1/2025-08-07/3c61e459-6b81-4b8b-a2ef-0e1e6c6db146)
   * @param fileName 파일명 (예: raw_video001.mp4, crackId001/image.jpg)
   * @return S3 public URL
   */
  public static String generateS3PublicUrl(String bucketName, String taskS3Path, String fileName) {
    if (bucketName == null || bucketName.isEmpty() || 
        taskS3Path == null || taskS3Path.isEmpty() || 
        fileName == null || fileName.isEmpty()) {
      log.warn("S3 URL 생성 실패: 필수 파라미터 누락 - bucketName={}, taskS3Path={}, fileName={}", 
          bucketName, taskS3Path, fileName);
      return null;
    }
    
    String fullKey = taskS3Path + "/" + fileName;
    return String.format("https://%s.s3.amazonaws.com/%s", bucketName, fullKey);
  }
} 