package com.b102.cracktrack.domain.user.repository;

import com.b102.cracktrack.domain.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

  boolean existsByEmail(String email);
  
  Optional<User> findByEmail(String email);
}
