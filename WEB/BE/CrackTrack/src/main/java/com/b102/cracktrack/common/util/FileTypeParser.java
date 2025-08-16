package com.b102.cracktrack.common.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileTypeParser {
  // 파싱 결과 타입 상수
  public static final String TYPE_VIDEO = "VIDEO";
  public static final String TYPE_DETECTION = "DETECTION";
  public static final String TYPE_MODELING = "MODELING";
  public static final String TYPE_SEGMENT = "SEGMENT";
  public static final String TYPE_IMAGE = "IMAGE";
  public static final String TYPE_LIDAR = "LIDAR";
  public static final String TYPE_UNKNOWN = "UNKNOWN";

  /**
   * S3 파일명을 보고 엔티티 타입을 파싱합니다.
   * 
   * @param fileName 파일명 (예: raw_video001.mp4, detected_video001.mp4, modeling001.obj, crackId001/segment.jpg, crackId001/image.jpg, crackId001/lidar.json)
   * @return 엔티티 타입 (VIDEO, DETECTION, MODELING, SEGMENT, IMAGE, LIDAR)
   */
  public static String parseFileType(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      log.warn("파일명이 null이거나 비어있음: {}", fileName);
      return TYPE_UNKNOWN;
    }

    // 전체 키와 파일명 분리
    String fullKeyLower = fileName.toLowerCase();
    String actualFileName = fileName;
    if (fileName.contains("/")) {
      String[] parts = fileName.split("/");
      actualFileName = parts[parts.length - 1];
    }

    String lowerFileName = actualFileName.toLowerCase();

    // 확장자 추출
    String extension = "";
    int lastDotIndex = lowerFileName.lastIndexOf('.');
    if (lastDotIndex != -1 && lastDotIndex < lowerFileName.length() - 1) {
      extension = lowerFileName.substring(lastDotIndex);
    }

    // 비디오 파일 (raw_video*, detected_video*)
    if (lowerFileName.startsWith("raw_video") && (extension.isEmpty() || extension.equals(".mp4") || extension.equals(".mov") || extension.equals(".mkv"))) {
      return TYPE_VIDEO;
    }
    if (lowerFileName.startsWith("detected_video") && (extension.isEmpty() || extension.equals(".mp4") || extension.equals(".mov") || extension.equals(".mkv"))) {
      return TYPE_DETECTION;
    }

    // 모델링 파일 (modeling* 또는 확장자 기반)
    if (lowerFileName.startsWith("modeling") || extension.equals(".obj") || extension.equals(".glb") || extension.equals(".gltf") || extension.equals(".ply") || extension.equals(".fbx")) {
      return TYPE_MODELING;
    }

    // 세그먼트 파일 (segment.*)
    if ((lowerFileName.equals("segment") || lowerFileName.startsWith("segment")) && (extension.equals(".jpeg") || extension.equals(".jpg") || extension.equals(".png"))) {
      return TYPE_SEGMENT;
    }

    // 이미지 파일 (image.*)
    if ((lowerFileName.equals("image") || lowerFileName.startsWith("image")) && (extension.equals(".jpeg") || extension.equals(".jpg") || extension.equals(".png"))) {
      return TYPE_IMAGE;
    }

    // 라이더 파일 (파일명/경로에 lidar 포함 + json 등)
    if (lowerFileName.equals("lidar") || lowerFileName.startsWith("lidar") || fullKeyLower.contains("/lidar/")) {
      if (extension.equals(".json") || extension.equals(".las") || extension.equals(".laz")) {
        return TYPE_LIDAR;
      }
    }

    // 추가적인 확장자 기반 검사 (lidar)
    if ((extension.equals(".json") || extension.equals(".las") || extension.equals(".laz")) && (lowerFileName.contains("lidar") || fullKeyLower.contains("/lidar"))) {
      return TYPE_LIDAR;
    }

    log.warn("알 수 없는 파일 타입: {}", fileName);
    return TYPE_UNKNOWN;
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

    // URL 또는 전체 키 어디에서든 'crack'으로 시작하는 세그먼트를 탐색
    String[] parts = fileName.split("/");
    for (String part : parts) {
      if (part == null || part.isEmpty()) continue;
      String lowered = part.toLowerCase();
      if (lowered.startsWith("crack")) {
        return part; // 원본 케이스 보존
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
    
    // taskS3Path가 URL이면 경로만 추출, 아니면 그대로 사용
    String cleanPath = taskS3Path;
    if (taskS3Path.startsWith("http")) {
      // URL에서 도메인 부분 제거하고 경로만 사용
      String[] parts = taskS3Path.split("/", 4); // 최대 4개로 분할
      if (parts.length >= 4) {
        cleanPath = parts[3]; // 4번째 부분부터가 실제 경로
        log.info("URL에서 경로 추출: {} -> {}", taskS3Path, cleanPath);
      } else {
        log.warn("URL 파싱 실패, 원본 경로 사용: {}", taskS3Path);
      }
    }
    
    String fullKey = cleanPath + "/" + fileName;
    String result = String.format("https://%s.s3.amazonaws.com/%s", bucketName, fullKey);
    log.debug("S3 URL 생성: bucketName={}, cleanPath={}, fileName={}, result={}", 
        bucketName, cleanPath, fileName, result);
    return result;
  }
} 