package com.b102.cracktrack.domain.video.service.impl;

import com.b102.cracktrack.common.s3.S3Service;
import com.b102.cracktrack.domain.drone.entity.Drone;
import com.b102.cracktrack.domain.drone.repository.DroneRepository;
import com.b102.cracktrack.domain.drone.service.DroneService;
import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.location.repository.LocationRepository;
import com.b102.cracktrack.domain.video.dto.VideoResponsetDto;
import com.b102.cracktrack.domain.video.dto.VideoSummaryResponseDto;
import com.b102.cracktrack.domain.video.entity.Video;
import com.b102.cracktrack.domain.video.repository.VideoRepository;
import com.b102.cracktrack.domain.video.service.VideoService;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService {

  private final VideoRepository videoRepository;
  private final UserRepository userRepository;
  private final DroneRepository droneRepository;
  private final LocationRepository locationRepository;
  private final S3Service s3Service;

  @Transactional
  @Override
  public VideoResponsetDto uploadVideo(MultipartFile file, Long locationId, Long userId) {
    User u = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("없는 유저"));
    Location l = locationRepository.findById(locationId)
        .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 장소"));

    String s3key = s3Service.uploadFile(file);
    log.info("[service] 업로드성공");
    Drone drone = droneRepository.findByUser_UserId(userId)
        .orElseThrow(() -> new IllegalArgumentException("드론 없음"));

    Video v = Video.builder()
        .userId(userId)
        .location(l)
        .s3key(s3key)
        .droneId(drone.getDroneId())
        .build();
    videoRepository.save(v);
    String presignedUrl = s3Service.generatePresignedUrl(s3key);
    log.info("[service] presignedUrl: {}", presignedUrl);

    return VideoResponsetDto.from(v, presignedUrl);
  }

  @Transactional
  @Override
  public void deleteVideo(Long detectingVideoId, Long userId) {
    Video d = videoRepository.findById(detectingVideoId)
        .orElseThrow(() -> new IllegalArgumentException("해당 영상은 이미 삭제되었습니다."));
    if (d.getUserId().equals(userId)) {
      throw new IllegalArgumentException("본인 영상만 삭제 가능합니다.");
    }
    s3Service.deleteFile(d.getS3key());
    videoRepository.delete(d);
    log.info("[service] 삭제성공");
  }

  @Transactional(readOnly = true)
  @Override
  public VideoResponsetDto findVideoById(Long videoId) {
    Video v = videoRepository.findById(videoId)
        .orElseThrow(() -> new NoSuchElementException("영상이 없습니다."));
    String presignedUrl = s3Service.generatePresignedUrl(v.getS3key());
    return VideoResponsetDto.from(v, presignedUrl);
  }

  /**
   * 마찬가지로 이후에 사용예정
   */
  @Transactional(readOnly = true)
  @Override
  public List<VideoSummaryResponseDto> findMyVideoAsc(Long userId) {
    List<Video> videoList = videoRepository.findAllByLocationLocationIdOrderByActivatedAtAsc(
        userId);
    log.info("[service] 오름차순 조회: {}", videoList.size());
    List<VideoSummaryResponseDto> videoSummaryResponseDtoList = new ArrayList<>();
    for (Video d : videoList) {
      String presignedUrl = s3Service.generatePresignedUrl(d.getS3key());
      videoSummaryResponseDtoList.add(
          VideoSummaryResponseDto.from(d, presignedUrl));
    }
    return videoSummaryResponseDtoList;
  }

  @Transactional(readOnly = true)
  @Override
  public List<VideoSummaryResponseDto> findMyVideoDesc(Long userId) {
    List<Video> videoList = videoRepository.findAllByLocationLocationIdOrderByActivatedAtDesc(
        userId);
    log.info("[service] 내림차순 조회: {}", videoList.size());
    List<VideoSummaryResponseDto> videoSummaryResponseDtoList = new ArrayList<>();
    for (Video d : videoList) {
      String presignedUrl = s3Service.generatePresignedUrl(d.getS3key());
      videoSummaryResponseDtoList.add(
          VideoSummaryResponseDto.from(d, presignedUrl));
    }
    return videoSummaryResponseDtoList;
  }


}
