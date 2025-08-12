package com.b102.cracktrack.domain.task.service.impl;

import com.b102.cracktrack.common.enums.Region;
import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.service.CrackService;
import com.b102.cracktrack.domain.detection.entity.Detection;
import com.b102.cracktrack.domain.detection.repository.DetectionRepository;
import com.b102.cracktrack.domain.district.entity.District;
import com.b102.cracktrack.domain.district.repository.DistrictRepository;
import com.b102.cracktrack.domain.modeling.entity.Modeling;
import com.b102.cracktrack.domain.modeling.repository.ModelingRepository;
import com.b102.cracktrack.domain.task.dto.TaskDetailResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskFirstResponseDto;
import com.b102.cracktrack.domain.task.dto.TaskResponseDto;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.task.repository.TaskRepository;
import com.b102.cracktrack.domain.task.service.TaskService;
import com.b102.cracktrack.domain.user.entity.User;
import com.b102.cracktrack.domain.user.repository.UserRepository;
import com.b102.cracktrack.domain.video.entity.Video;
import com.b102.cracktrack.domain.video.repository.VideoRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

  private final TaskRepository taskRepository;
  private final UserRepository userRepository;
  private final DistrictRepository districtRepository;
  private final VideoRepository videoRepository;
  private final DetectionRepository detectionRepository;
  private final ModelingRepository modelingRepository;
  private final CrackService crackService;

  @Transactional
  @Override
  public TaskFirstResponseDto createTask(String districtPath, Long userId) {
    // 작업 생성: "RegionKoreanName - 시/군 - 구" 형태 문자열을 파싱하여 District를 조회/생성 후 Task 생성
    log.info("Task 생성 요청: districtPath: {}, userId: {}", districtPath, userId);
    String uuid = UUID.randomUUID().toString();
    String key = "u" + userId + "/" + LocalDate.now() + "/" + uuid;

    User user = userRepository.findById(userId).orElseThrow(() -> {
      log.warn("Task 생성 에러: 사용자 없음. userId:{}", userId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
    });

    // 입력 예: "서울특별시 강남구" 또는 "경기도 성남시 분당구"
    // 양끝 따옴표 제거 후 공백 기준 분리
    String normalizedPath = districtPath == null ? "" : districtPath.trim();
    log.debug("Task 생성 입력 정규화 전: raw='{}'", districtPath);
    if (normalizedPath.startsWith("\"") && normalizedPath.endsWith("\"") && normalizedPath.length() >= 2) {
      normalizedPath = normalizedPath.substring(1, normalizedPath.length() - 1).trim();
    }
    log.debug("Task 생성 입력 정규화 후: normalized='{}'", normalizedPath);
    String[] parts = normalizedPath.split("\\s+");
    if (parts.length < 2) {
      log.warn("Task 생성 에러: 구역 파싱 실패(토큰 부족). normalized='{}'", normalizedPath);
      throw new ApiException(HttpStatus.BAD_REQUEST.value(), ErrorMessage.BAD_REQUEST);
    }
    String regionKoreanName = parts[0].trim();
    Region region = Region.fromKoreanName(regionKoreanName);
    log.info("Task 생성 Region 매핑: '{}' -> {}", regionKoreanName, region);

    // 나머지 파트 합치기: 공백 제거하여 하나의 이름으로 정규화 (예: "성남시 분당구" -> "성남시분당구")
    StringBuilder districtNameBuilder = new StringBuilder();
    for (int i = 1; i < parts.length; i++) {
      String token = parts[i].trim();
      if (!token.isEmpty()) {
        districtNameBuilder.append(token);
      }
    }
    String districtName = districtNameBuilder.toString();
    log.info("Task 생성 디스트릭트명 정규화: '{}'", districtName);

    // 이미 존재하면 재사용, 없으면 생성 (Region+Name 기준)
    log.debug("디스트릭트 조회 시도: region={}, name='{}'", region, districtName);
    District district = districtRepository.findByRegionAndName(region, districtName).orElse(null);
    if (district == null) {
      district = districtRepository.save(
          District.builder().region(region).name(districtName).build()
      );
      log.info("신규 디스트릭트 생성: id={}, region={}, name='{}'", district.getDistrictId(), region, districtName);
    } else {
      log.info("기존 디스트릭트 사용: id={}, region={}, name='{}'", district.getDistrictId(), region, districtName);
    }

    Task task = Task.builder()
        .user(user)
        .district(district)
        .name(district.getName())
        .s3Name(key)
        .build();
    taskRepository.save(task);
    log.info("Task 생성 성공: taskId: {}, s3Name: {}", task.getTaskId(), task.getS3Name());
    return TaskFirstResponseDto.from(task, district.getName());
  }

  @Transactional
  @Override
  public void deleteTask(Long taskId, Long userId) {
    log.info("Task 삭제: taskId: {}", taskId);
    Task task = taskRepository.findById(taskId).orElseThrow(() -> {
      log.error("Task 삭제 에러: 작업 없음. taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    });
    if (!task.getUser().getUserId().equals(userId)) {
      log.error("Task 삭제 실패: 권한이 없는 유저. task.userID: {}, userId: {}", task.getUser().getUserId(),
          userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    task.softDelete();
    log.info("Task 삭제 성공: taskId: {}", taskId);
  }

  @Transactional
  @Override
  public void completeTask(String s3Name) {
    log.info("Task 완료 처리: taskName: {}", s3Name);

    Task t = taskRepository.findByS3Name(s3Name).orElseThrow(()->{
      log.error("Task 완료 처리 실패: 작업없음, s3Name: {}", s3Name);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    });
    t.setInactive();
  }

  @Transactional(readOnly = true)
  @Override
  public List<TaskResponseDto> findByDistrictId(Long districtId, Long userId) {
    log.info("Task 구역별 작업 목록 조회: districtId: {}, userId: {}", districtId, userId);

    District district = districtRepository.findById(districtId).orElseThrow(() -> {
      log.error("Task 구역별 작업 목록 조회 실패: districtId: {}", districtId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.DISTRICT_NOT_FOUND);
    });

    List<Task> tasks = taskRepository.findByDistrictDistrictId(districtId);
    log.info("Task 구역별 작업 목록 조회 성공: districtId: {}, userId: {}", districtId, userId);
    return tasks.stream()
        .map(task -> TaskResponseDto.from(task, district.getName())).collect(Collectors.toList());
  }

  /**
   * 유저의 작업 전체 목록 조회 서비스 단에서 해시 맵으로 해결 vs JPQL로 레포지토리 단에서 dto를 가져옴
   *
   * @param userId 요청 보낸 유저의 id
   * @return 유저가 작업한 모든 목록들
   */
  @Transactional(readOnly = true)
  @Override
  public List<TaskResponseDto> findAllTasks(Long userId) {

    log.info("Task 유저 작업 목록 조회 userId: {}", userId);
    User user = userRepository.findById(userId).orElseThrow(() -> {
      log.error("Task 유저 작업 목록 조회 실패: userId: {}", userId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
    });
    List<Task> tasks = taskRepository.findByUserUserId(userId);
    log.info("Task 유저 작업 목록 조회 성공 userId: {}", userId);

    // 각 Task의 District에서 이름을 가져와 매핑
    Map<Long, String> districtNameMap = tasks.stream()
        .map(Task::getDistrict)
        .filter(d -> d != null)
        .collect(Collectors.toMap(District::getDistrictId, District::getName, (a, b) -> a));

    log.info("Task 유저 작업 목록 조회 성공 userId: {}", userId);
    return tasks.stream()
        .map(task -> TaskResponseDto.from(task, task.getDistrict() == null ? null : districtNameMap.get(task.getDistrict().getDistrictId())))
        .collect(Collectors.toList());
  }

  /**
   * 전체 조회
   *
   * @param taskId 상세 보기를 하고 싶은 주체의 Id
   * @return 한 작업의 영상, 랜더링, 디텍팅 영상, 균열 정보들
   */
  @Transactional(readOnly = true)
  @Override
  public TaskDetailResponseDto findTaskDetails(Long taskId, Long userId) {
    log.info("Task 유저 작업 상세 조회 taskId:{}, userId: {}", taskId, userId);
    Task task = taskRepository.findById(taskId).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 작업없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    });

    String locationName = task.getDistrict() == null ? null : task.getDistrict().getName();

    Detection d = detectionRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 디텍팅 없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.DETECTION_NOT_FOUND);
    });

    Modeling m = modelingRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 모델링 없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.MODELING_NOT_FOUND);
    });

    Video v = videoRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 영상없음 videoId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.VIDEO_NOT_FOUND);
    });

    List<CrackResponseDto> cracks = crackService.findCracksByTaskId(taskId, userId);

    return new TaskDetailResponseDto(taskId, locationName, task.getDescription(), d.getS3Url(), m.getS3Url(), v.getS3Url(),
        cracks,
        task.getActivatedAt());
  }

  @Transactional
  @Override
  public TaskDetailResponseDto writeDescription(Long taskId, Long userId, String description) {
    log.info("Task 메모 작성: taskId: {}, userId: {}", taskId, userId);
    Task task = taskRepository.findById(taskId).orElseThrow(()->{
      log.error("Task 메모 작성 실패: 작업 없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    });
    if(!task.getUser().getUserId().equals(userId)){
      log.error("Task 메모 작성 실패: 작업 유저 아님 task의 유저Id: {}, userId: {}", task.getUser().getUserId(), userId);
      throw new  ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }
    task.ChangeDescription(description);
    log.info("Task 메모 작성 성공");

    String locationName = task.getDistrict() == null ? null : task.getDistrict().getName();

    Detection d = detectionRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 메모 작성 실패: 디텍팅 없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.DETECTION_NOT_FOUND);
    });

    Modeling m = modelingRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 메모 작성 실패: 모델링 없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.MODELING_NOT_FOUND);
    });

    Video v = videoRepository.findByTaskTaskId(taskId).orElseThrow(() -> {
      log.error("Task 메모 작성 실패: 영상없음 videoId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.VIDEO_NOT_FOUND);
    });

    List<CrackResponseDto> cracks = crackService.findCracksByTaskId(taskId, userId);

    return new TaskDetailResponseDto(taskId, locationName, task.getDescription(), d.getS3Url(), m.getS3Url(), v.getS3Url(),
        cracks,
        task.getActivatedAt());
  }
}
