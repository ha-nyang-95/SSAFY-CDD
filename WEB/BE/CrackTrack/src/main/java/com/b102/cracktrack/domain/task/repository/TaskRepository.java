package com.b102.cracktrack.domain.task.repository;

import com.b102.cracktrack.common.enums.Region;
import com.b102.cracktrack.domain.task.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

  // 유저별 작업 조회
  List<Task> findByUserUserId(Long userId);

  // 구역별(디스트릭트) 작업 조회
  List<Task> findByDistrictDistrictId(Long districtId);

  // UUID로 Task 조회
  Optional<Task> findByS3Name(String s3Name);
}