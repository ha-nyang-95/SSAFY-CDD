package com.b102.cracktrack.domain.location.dto;

import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.user.entity.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LocationRequestDto(
    @NotBlank(message = "장소명은 필수입니다.")
    @Size(min = 2, message = "장소명은 2자 이상 입력해야 합니다.")
    String name,
    Double latitude,
    Double longitude
) {

  public static Location from(LocationRequestDto dto, User user) {
    return Location.builder()
        .latitude(dto.latitude)
        .longitude(dto.longitude)
        .name(dto.name())
        .user(user)
        .build();
  }
}
