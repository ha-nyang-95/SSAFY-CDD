package com.teto.cracktrack.domain.user.dto;

import com.teto.cracktrack.domain.user.entity.User;

public record UserRequestDto(
    String email,
    String password,
    String name
) {
    public static User from(UserRequestDto userRequestDto) {
        User u = User.builder()
            .email(userRequestDto.email)
            .password(userRequestDto.password)
            .name(userRequestDto.name)
            .build();

        return u;
    }
}
