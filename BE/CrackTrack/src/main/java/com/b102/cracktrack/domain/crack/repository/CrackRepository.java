package com.b102.cracktrack.domain.crack.repository;

import com.b102.cracktrack.domain.crack.entity.Crack;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CrackRepository extends JpaRepository<Crack, Long> {

  List<Crack> findAllByLocationIdOrderByActivatedAtAsc(Long locationId);

  List<Crack> findAllByLocationIdOrderByActivatedAtDesc(Long locationId);

  // @Query("SELECT c FROM Crack c WHERE c.locationId = :locationId ORDER BY c.activatedAt ASC")
  // List<Crack> findByLocationIdOrderByActivatedAtAsc(@Param("locationId") Long locationId);

}
