package com.b102.cracktrack.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Region {

  SEOUL("서울특별시"),
  BUSAN("부산광역시"),
  DAEGU("대구광역시"),
  INCHEON("인천광역시"),
  GWANGJU("광주광역시"),
  DAEJEON("대전광역시"),
  ULSAN("울산광역시"),
  SEJONG("세종특별자치시"),
  GYEONGGI("경기도"),
  GANGWON("강원특별자치도"),
  CHUNGBUK("충청북도"),
  CHUNGNAM("충청남도"),
  JEONBUK("전라북도"),
  JEONNAM("전라남도"),
  GYEONGBUK("경상북도"),
  GYEONGNAM("경상남도"),
  JEJU("제주특별자치도");

  private final String koreanName;

  public static Region fromKoreanName(String koreanName) {
    if (koreanName == null) {
      throw new IllegalArgumentException("Unknown region name: null");
    }
    // 양끝/양따옴표 제거 및 공백 정규화
    String normalized = koreanName.trim();
    if (normalized.startsWith("\"") && normalized.endsWith("\"") && normalized.length() >= 2) {
      normalized = normalized.substring(1, normalized.length() - 1).trim();
    }
    for (Region region : values()) {
      if (region.koreanName.equals(normalized)) {
        return region;
      }
    }
    throw new IllegalArgumentException("Unknown region name: " + koreanName);
  }
}
