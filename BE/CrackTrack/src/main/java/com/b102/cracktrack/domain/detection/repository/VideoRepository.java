package com.b102.cracktrack.domain.detection.repository;

import com.b102.cracktrack.domain.detection.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

}
