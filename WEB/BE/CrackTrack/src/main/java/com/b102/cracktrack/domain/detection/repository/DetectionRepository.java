package com.b102.cracktrack.domain.detection.repository;


import com.b102.cracktrack.domain.detection.entity.Detection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetectionRepository extends JpaRepository<Detection, Long> {

  // 특정 작업에 해당하는 디텍션 조회
  Optional<Detection> findByTaskTaskId(Long taskId);

}
