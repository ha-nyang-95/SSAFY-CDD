package com.b102.cracktrack.common.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileTypeParser {

  /**
   * S3 파일명을 보고 엔티티 타입을 파싱합니다.
   * 
   * @param fileName 파일명 (예: raw_video20250806154500.mp4, Modeling20250806154500.obj, uuid/crackId001/segment.jpg)
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
    if (lowerFileName.equals("segment.jpeg") || lowerFileName.equals("segment.jpg")) {
      return "SEGMENT";
    }
    
    // 이미지 파일 (image.jpeg, image.jpg)
    if (lowerFileName.equals("image.jpeg") || lowerFileName.equals("image.jpg")) {
      return "IMAGE";
    }
    
    // 라이더 파일 (lidar.json)
    if (lowerFileName.equals("lidar.json")) {
      return "LIDAR";
    }
    
    log.warn("알 수 없는 파일 타입: {}", fileName);
    return "UNKNOWN";
  }

  /**
   * 파일명에서 crackId를 추출합니다.
   * 
   * @param fileName 파일명 (예: crackId0/image.jpeg, uuid/crackId001/segment.jpg)
   * @return crackId (예: crackId0, crackId001)
   */
  public static String extractCrackId(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      return null;
    }

    // crackId 폴더 내의 파일인 경우 crackId 추출
    if (fileName.contains("/")) {
      String[] parts = fileName.split("/");
      
      // UUID/crackId001/segment.jpg 형태인 경우
      if (parts.length >= 3) {
        // 두 번째 부분이 crackId로 시작하는지 확인
        if (parts[1].startsWith("crackId")) {
          return parts[1]; // crackId001, crackId002 등
        }
      }
      
      // crackId001/segment.jpg 형태인 경우 (기존 로직)
      if (parts.length >= 2 && parts[0].startsWith("crackId")) {
        return parts[0]; // crackId0, crackId1 등
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
} 