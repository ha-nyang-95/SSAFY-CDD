package com.b102.cracktrack.domain.lidar.repository;

import com.b102.cracktrack.domain.lidar.entity.Lidar;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LidarRepository extends JpaRepository<Lidar, Long> {

  @Query(
      "SELECT l From Segment l WHERE l.crack.task.taskId =: taskId"
  )
  List<Lidar> findAllByTaskId(Long taskId);

  Optional<Lidar> findByCrackCrackId(Long crackId);
}
