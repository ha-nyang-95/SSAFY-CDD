package com.b102.cracktrack.domain.video.repository;

import com.b102.cracktrack.domain.video.entity.Video;
import java.util.List;
import java.util.Optional;
import javax.swing.text.html.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

  Optional<Video> findByTaskTaskId(Long taskId);

}
