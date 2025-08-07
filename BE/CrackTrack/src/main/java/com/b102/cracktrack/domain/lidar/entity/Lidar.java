package com.b102.cracktrack.domain.lidar.entity;


import com.b102.cracktrack.domain.crack.entity.Crack;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lidars")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Lidar {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long lidarId;

  @Column(nullable = false)
  private String s3Url;

  @OneToOne
  @JoinColumn(name = "lidar_id")
  private Crack crack;
}
