package com.b102.cracktrack.domain.task.entity;

import com.b102.cracktrack.common.entity.BaseEntity;
import com.b102.cracktrack.common.enums.Region;
import com.b102.cracktrack.domain.district.entity.District;
import com.b102.cracktrack.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DialectOverride.Where;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "tasks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class Task extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "task_id")
  private Long taskId;

  @Column(nullable = false)
  private String name;

  @Column(name = "s3_name", nullable = false)
  private String s3Name;

  @Column
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "district_id")
  private District district;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;


  public void ChangeDescription(String description) {
    this.description = description;
  }
}
