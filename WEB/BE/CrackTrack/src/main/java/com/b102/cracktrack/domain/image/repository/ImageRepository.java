package com.b102.cracktrack.domain.image.repository;

import com.b102.cracktrack.domain.image.entity.Image;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

  @Query(
      "SELECT i From Image i WHERE i.crack.task.taskId =: taskId"
  )
  List<Image> findAllByTaskId(Long taskId);

  Optional<Image> findByCrackCrackId(Long crackId);
}
