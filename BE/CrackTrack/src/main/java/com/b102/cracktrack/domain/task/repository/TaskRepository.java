package com.b102.cracktrack.domain.task.repository;

import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import com.b102.cracktrack.domain.task.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

  // 유저별 업무 조회
  List<Task> findByUserUserId(Long userid);

  // 지역별 업무조회
  List<Task> findByLocationId(Long locationId);

  // UUID로 Task 조회
  Optional<Task> findByS3Name(String s3Name);

  @Query("SELECT new com.b102.cracktrack.domain.task.dto.TaskResponseDto("
      + "t.taskId, l.name, t.activatedAt) "
      + "FROM Task t JOIN Location l ON t.locationId = l.locationId "
      + "WHERE t.user.userId = :userId")
  List<TaskResponseDto> findTaskResponseDtoByUserId(@Param("userId") Long userId);

}
