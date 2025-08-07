package com.b102.cracktrack.domain.modeling.repository;

import com.b102.cracktrack.domain.modeling.entity.Modeling;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModelingRepository extends JpaRepository<Modeling,Long> {

  Optional<Modeling> findByTaskTaskId(Long taskId);
}
