package com.b102.cracktrack.domain.drone.entity;


import com.b102.cracktrack.common.entity.BaseEntity;
import com.b102.cracktrack.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "drones")
public class Drone extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long droneId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String serialNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;


}
