package com.teto.cracktrack.domain.drone.repository;

import com.teto.cracktrack.domain.drone.entity.Drone;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DroneRepository extends JpaRepository<Drone, Long> {

//  Optional<Drone> findBySerialNumber(String serialNumber);

  Optional<Drone> findByUser_UserId(Long userId);

  boolean existsByUser_UserId(Long userId);
}
