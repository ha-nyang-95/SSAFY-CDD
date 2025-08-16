package com.b102.cracktrack.domain.video.service.impl;

import com.b102.cracktrack.common.util.FileTypeParser;
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
    
    // FileTypeParser를 사용하여 일관된 S3 URL 생성
    String s3Url = FileTypeParser.generateS3PublicUrl(s3Bucket, task.getS3Name(), fileName);
    
    if (s3Url == null) {
      log.error("S3 URL 생성 실패 - taskId: {}, fileName: {}", taskId, fileName);
      throw new RuntimeException("S3 URL 생성에 실패했습니다.");
    }
    
    Video video = Video.builder()
        .task(task)
        .s3Url(s3Url)
        .build();
    
    videoRepository.save(video);
    
    log.info("비디오 생성 완료 - videoId: {}, S3 URL: {}", video.getVideoId(), s3Url);
  }
} 