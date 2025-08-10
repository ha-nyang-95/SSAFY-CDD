package com.b102.cracktrack.domain.video.service.impl;

import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.video.entity.Video;
import com.b102.cracktrack.domain.video.repository.VideoRepository;
import com.b102.cracktrack.domain.video.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService {

  private final VideoRepository videoRepository;
  private final TaskRepository taskRepository;

  @Value("${cloud.aws.s3.bucket}")
  private String s3Bucket;

  @Value("${cloud.aws.region.static}")
  private String awsRegion;

  @Override
  @Transactional
  public void createVideo(Long taskId, String fileName) {
    log.info("비디오 생성 시작 - taskId: {}, fileName: {}", taskId, fileName);
    
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task를 찾을 수 없습니다: " + taskId));
    
    // S3 퍼블릭 URL 생성 (브라우저에서 접근 가능한 형태)
    String s3Url = String.format("https://%s.s3.%s.amazonaws.com/%s", s3Bucket, awsRegion, fileName);
    
    Video video = Video.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    videoRepository.save(video);
    
    log.info("비디오 생성 완료 - videoId: {}", video.getVideoId());
  }
} 