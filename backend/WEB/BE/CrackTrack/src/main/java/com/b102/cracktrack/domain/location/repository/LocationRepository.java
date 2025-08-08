package com.b102.cracktrack.domain.location.repository;

import com.b102.cracktrack.domain.location.entity.Location;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

  List<Location> findByUserUserId(Long userId);

}
