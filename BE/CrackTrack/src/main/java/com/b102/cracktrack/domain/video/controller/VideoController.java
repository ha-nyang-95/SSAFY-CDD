package com.b102.cracktrack.domain.video.controller;

import com.b102.cracktrack.common.util.ApiResult;
import com.b102.cracktrack.domain.video.dto.VideoResponsetDto;
import com.b102.cracktrack.domain.video.service.VideoService;
import com.b102.cracktrack.domain.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "디텍팅 영상", description = "디텍팅 영상 저장, 삭제, 조회")
@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoController {

  private final VideoService videoService;

  @Operation(summary = "영상 등록", description = "영상을 s3에 저장 아직 완료되지 않음 추후 구현 예정")
  @PostMapping(value = "/upload/{locationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResult<VideoResponsetDto>> uplaodVideo(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable Long locationId,
      @RequestPart("file") MultipartFile file) {
    VideoResponsetDto responseDto = videoService.uploadVideo(file, locationId,
        userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(responseDto));
  }

  @Operation(summary = "영상 삭제", description = "영상을 s3에서 삭제 후 db 삭제")
  @DeleteMapping("/delete/{videoId}")
  public ResponseEntity<ApiResult<Void>> deleteVideo(
      @AuthenticationPrincipal UserPrincipal userPrincipal, @PathVariable Long videoId) {
    videoService.deleteVideo(videoId, userPrincipal.getUserId());
    return ResponseEntity.ok(ApiResult.success(204, "영상 삭제 완료", null));
  }

  @Operation(summary = "영상 조회", description = "id에 맞추어 필요한 영상을 호출")
  @GetMapping("/{videoId}")
  public ResponseEntity<ApiResult<VideoResponsetDto>> findVideo(@PathVariable Long videoId) {
    return ResponseEntity.ok(ApiResult.success(videoService.findVideoById(videoId)));
  }
}
