package com.teto.cracktrack.domain.user.dto;

import com.teto.cracktrack.domain.user.entity.User.Role;

public record UpdateUserDto(
    String username,
    String password,
    Role role
) {
}
