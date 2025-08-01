package com.b102.cracktrack.domain.ivs.entity;

import com.b102.cracktrack.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 해당 테이블은 사용하지 않습니다.
 * 이후 확장의 측면에서 필요하다면 사용할 예정입니다.
 */
@Entity
@Table(name = "ivs_channels")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class IvsChannel extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long ivsChannelId;

  @Column(nullable = false)
  private Long droneId;

  @Column(nullable = false)
  private Long userId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String channelArn; // 채널 id값


}
