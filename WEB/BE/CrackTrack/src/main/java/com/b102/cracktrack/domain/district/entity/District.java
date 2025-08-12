package com.b102.cracktrack.domain.district.entity;

import com.b102.cracktrack.common.enums.Region;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "districts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class District {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long districtId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Region region;

  @Column(nullable = false)
  private String name;

}
