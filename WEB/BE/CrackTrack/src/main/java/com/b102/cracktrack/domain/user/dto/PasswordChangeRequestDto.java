package com.b102.cracktrack.domain.user.dto;

public record PasswordChangeRequestDto(
    String oldPassword,
    String newPassword
) {

}
