package com.b102.cracktrack.domain.crack.repository;

import com.b102.cracktrack.domain.crack.entity.Crack;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrackRepository extends JpaRepository<Crack, Long> {

  List<Crack> findByTaskTaskId(Long taskId);
  
  // taskId와 crackIdString으로 Crack 찾기
  Optional<Crack> findByTaskTaskIdAndCrackIdString(Long taskId, String crackIdString);
}
