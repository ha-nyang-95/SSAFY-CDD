package com.b102.cracktrack.domain.segment.repository;

import com.b102.cracktrack.domain.segment.entity.Segment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SegmentRepository extends JpaRepository<Segment, Long> {

  @Query(
      "SELECT s From Segment s WHERE s.crack.task.taskId =: taskId"
  )
  List<Segment> findAllByTaskId(Long taskId);

  Optional<Segment> findByCrackCrackId(Long crackId);
}
