package com.b102.cracktrack.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
@MappedSuperclass
public abstract class BaseEntity {

  public enum Status {
    ACTIVE,INACTIVE,DELETED
  }

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  @Column(nullable = false)
  private LocalDateTime activatedAt;

  @Column
  private LocalDateTime deactivatedAt;

  @Column
  private LocalDateTime deletedAt;

  @PrePersist
  protected void setActive(){
    if(this.activatedAt == null){
      this.status = Status.ACTIVE;
      this.activatedAt = LocalDateTime.now();
    }
  }


  public void setInactive(){
    this.status = Status.INACTIVE;
    this.deactivatedAt = LocalDateTime.now();
  }

  public void softDelete(){
    this.status = Status.DELETED;
    this.deactivatedAt = LocalDateTime.now();
  }
}
