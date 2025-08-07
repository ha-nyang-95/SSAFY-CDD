package com.b102.cracktrack.domain.crack.entity;

import com.b102.cracktrack.common.entity.BaseEntity;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cracks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Crack extends BaseEntity {

  /**
   *  activated_at은 탐지일시
   *  deactivated_at은 확인 처리용(알고 있다는 의미)
   *  deleted_at은 잘못된 탐지여서 관리자측에서 관리하고 싶지않을때 삭제처리
   */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long crackId;

  @ManyToOne
  @JoinColumn(name = "task_id")
  private Task task;

}
