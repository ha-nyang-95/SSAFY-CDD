package com.teto.cracktrack.domain.user.entity;

import com.teto.cracktrack.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class User extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userId;

  @Column(nullable = false, unique = true, length = 30)
  private String email;

  @Column(nullable = false, length = 128)
  private String password;

  @Column(nullable = false, length = 20)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  public enum Role{
    GUEST, GENERAL, ADMIN
  }

  // 수정 메서드
  public void changePassword(String newPassword){
    this.password = newPassword;
  }

  public void changeName(String newName){
    this.name = newName;
  }

  public void changeRole(Role newRole){
    this.role = newRole;
  }
}
