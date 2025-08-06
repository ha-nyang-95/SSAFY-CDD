package com.b102.cracktrack.common.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileTypeParser {

  /**
   * 파일명을 보고 엔티티 타입을 파싱합니다.
   * 
   * @param fileName 파일명
   * @return 엔티티 타입 (VIDEO, DETECTION, MODELING, SEGMENT, IMAGE, LIDAR)
   */
  public static String parseFileType(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      log.warn("파일명이 null이거나 비어있음: {}", fileName);
      return "UNKNOWN";
    }

    String lowerFileName = fileName.toLowerCase();
    
    // 비디오 파일 (mp4, avi, mov 등)
    if (lowerFileName.contains("video") || 
        lowerFileName.endsWith(".mp4") || 
        lowerFileName.endsWith(".avi") || 
        lowerFileName.endsWith(".mov")) {
      return "VIDEO";
    }
    
    // 디텍션 파일 (detection으로 시작하거나 detection이 포함된 파일)
    if (lowerFileName.contains("detection") || 
        lowerFileName.contains("detect")) {
      return "DETECTION";
    }
    
    // 모델링 파일 (modeling, model, glb, obj 등)
    if (lowerFileName.contains("modeling") || 
        lowerFileName.contains("model") || 
        lowerFileName.endsWith(".glb") || 
        lowerFileName.endsWith(".obj")) {
      return "MODELING";
    }
    
    // 세그먼트 파일 (segment로 시작하거나 segment가 포함된 파일)
    if (lowerFileName.contains("segment")) {
      return "SEGMENT";
    }
    
    // 이미지 파일 (image로 시작하거나 이미지 확장자)
    if (lowerFileName.contains("image") || 
        lowerFileName.endsWith(".jpg") || 
        lowerFileName.endsWith(".jpeg") || 
        lowerFileName.endsWith(".png")) {
      return "IMAGE";
    }
    
    // 라이더 파일 (lidar로 시작하거나 json 파일)
    if (lowerFileName.contains("lidar") || 
        lowerFileName.endsWith(".json")) {
      return "LIDAR";
    }
    
    log.warn("알 수 없는 파일 타입: {}", fileName);
    return "UNKNOWN";
  }

  /**
   * 파일명에서 추적 키를 추출합니다.
   * 
   * @param fileName 파일명
   * @return 추적 키 (예: u01-d01-v01-c001)
   */
  public static String extractTrackingKey(String fileName) {
    if (fileName == null || fileName.isEmpty()) {
      return null;
    }

    // 파일명에서 추적 키 패턴 찾기 (예: u01-d01-v01-c001)
    String[] parts = fileName.split("[-_]");
    if (parts.length >= 4) {
      return parts[0] + "-" + parts[1] + "-" + parts[2] + "-" + parts[3];
    }
    
    return null;
  }
} 