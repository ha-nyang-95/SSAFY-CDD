package com.b102.cracktrack.domain.crack.dto;

import com.b102.cracktrack.domain.crack.entity.Crack;

public record CrackResponseDto(
    Long crackId,
    Long modelingId,
    String status,
    String activatedAt,
    String deactivatedAt,
    String deletedAt
) {

  public static CrackResponseDto from(Crack crack) {
    return new CrackResponseDto(
        crack.getCrackId(),
        1L,
        crack.getStatus().name(),
        crack.getActivatedAt().toString(),
        crack.getDeactivatedAt().toString(),
        crack.getDeletedAt().toString()
    );
  }
}
