package com.b102.cracktrack.domain.user.dto;


import com.b102.cracktrack.domain.user.entity.User;

public record UserResponseDto(
    Long userId,
    String email,
    String name,
    String role
) {
    public static UserResponseDto of(User user) {
        return new UserResponseDto(
            user.getUserId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }
}
