package com.b102.cracktrack.domain.video.service.impl;

import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.video.entity.Video;
import com.b102.cracktrack.domain.video.repository.VideoRepository;
import com.b102.cracktrack.domain.video.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService {

  private final VideoRepository videoRepository;
  private final TaskRepository taskRepository;

  @Override
  @Transactional
  public void createVideo(Long taskId, String fileName) {
    log.info("비디오 생성 시작 - taskId: {}, fileName: {}", taskId, fileName);
    
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: " + taskId));
    
    // S3 URL 생성 (실제 구현에서는 S3 경로로 변경)
    String s3Url = "s3://cracktrack/" + fileName;
    
    Video video = Video.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    videoRepository.save(video);
    
    log.info("비디오 생성 완료 - videoId: {}", video.getVideoId());
  }
} 