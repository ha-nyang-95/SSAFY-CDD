package com.b102.cracktrack.domain.video.service;

import com.b102.cracktrack.domain.video.dto.VideoResponsetDto;
import com.b102.cracktrack.domain.video.dto.VideoSummaryResponseDto;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface VideoService {

  VideoResponsetDto uploadVideo(MultipartFile file, Long locationId, Long userId);

  void deleteVideo(Long VideoId, Long userId);

  VideoResponsetDto findVideoById(Long videoId);

  List<VideoSummaryResponseDto> findMyVideoAsc(Long userId);

  List<VideoSummaryResponseDto> findMyVideoDesc(Long userId);

}
