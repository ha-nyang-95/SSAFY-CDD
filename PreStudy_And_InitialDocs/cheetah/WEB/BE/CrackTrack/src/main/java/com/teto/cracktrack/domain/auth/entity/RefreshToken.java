package com.teto.cracktrack.domain.auth.entity;

import com.teto.cracktrack.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refreshTokenId;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String token;

    @Builder
    public RefreshToken(Long userId, String token) {
        this.userId = userId;
        this.token = token;
    }

    public void updateToken(String newToken) {
        this.token = newToken;
    }
}