package com.b102.cracktrack.domain.task.service.impl;

import com.b102.cracktrack.common.exception.ApiException;
import com.b102.cracktrack.common.exception.ErrorMessage;
import com.b102.cracktrack.domain.crack.dto.CrackResponseDto;
import com.b102.cracktrack.domain.crack.service.CrackService;
import com.b102.cracktrack.domain.detection.entity.Detection;
import com.b102.cracktrack.domain.detection.repository.DetectionRepository;
import com.b102.cracktrack.domain.location.entity.Location;
import com.b102.cracktrack.domain.location.repository.LocationRepository;
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
import java.util.ArrayList;
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
  private final LocationRepository locationRepository;
  private final VideoRepository videoRepository;
  private final DetectionRepository detectionRepository;
  private final ModelingRepository modelingRepository;
  private final CrackService crackService;

  @Transactional
  @Override
  public TaskFirstResponseDto createTask(Long locationId, Long userId) {

    log.info("Task 생성: locationId: {}, userId: {}", locationId, userId);
    String uuid = UUID.randomUUID().toString();
    String key = "u" + userId + "/" + LocalDate.now() + "/" + uuid;
    User u = userRepository.findById(userId).orElseThrow(
        () -> {
          log.warn("Task 생성 에러: 사용자 없음. userId:{}", userId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.USER_NOT_FOUND);
        });

    Location l = locationRepository.findById(locationId).orElseThrow(
        () -> {
          log.warn("Task 생성 에러: 지역 없음. locationId:{}", locationId);
          return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
        });

    Task task = Task.builder()
        .user(u)
        .locationId(locationId)
        .s3Name(key)
        .build();
    taskRepository.save(task);
    log.info("Task 생성 성공: taskId: {}, s3Name: {}", task.getTaskId(), task.getS3Name());
    return TaskFirstResponseDto.from(task, l.getName());
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

  @Transactional(readOnly = true)
  @Override
  public List<TaskResponseDto> findByLocationId(Long locationId, Long userId) {
    log.info("Task 지역별 작업 목록 조회: locationId: {}, userId: {}", locationId, userId);

    Location l = locationRepository.findById(locationId).orElseThrow(() -> {
      log.error("Task 지역별 작업 목록 조회 실패: locationId: {}", locationId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.LOCATION_NOT_FOUND);
    });

    if (!l.getUser().getUserId().equals(userId)) {
      log.error("Task 지역별 작업 목록 조회 실패: 권한이 없는 유저. location.userID: {}, userId: {}",
          l.getUser().getUserId(), userId);
      throw new ApiException(HttpStatus.FORBIDDEN.value(), ErrorMessage.FORBIDDEN);
    }

    List<Task> tasks = taskRepository.findByLocationId(locationId);
    log.info("Task 지역별 작업 목록 조회 성공: locationId: {}, userId: {}", locationId, userId);
    return tasks.stream()
        .map(task -> TaskResponseDto.from(task, l.getName())).collect(Collectors.toList());
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
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.LOCATION_NOT_FOUND);
    });
    List<Task> tasks = taskRepository.findByUserUserId(userId);
    log.info("Task 유저 작업 목록 조회 성공 userId: {}", userId);

    // 1안
    Set<Long> locationIds = tasks.stream().map(Task::getLocationId).collect(Collectors.toSet());
    List<Location> locations = locationRepository.findAllById(locationIds);
    Map<Long, String> locationNameMap = locations.stream()
        .collect(Collectors.toMap(Location::getLocationId, Location::getName));

    // 2안
//    return taskRepository.findTaskResponseDtoByUserId(userId);

    log.info("Task 유저 작업 목록 조회 성공 userId: {}", userId);
    return tasks.stream()
        .map(task -> TaskResponseDto.from(task, locationNameMap.get(task.getLocationId())))
        .collect(Collectors.toList());
  }

  /**
   * 전체 조회
   *
   * @param taskId 상세 보기를 하고 싶은 주체의 Id
   * @return 한 작업의 영상, 랜더링, 디텍팅 영상, 균열 정보들
   */
  @Override
  public TaskDetailResponseDto findTaskDetails(Long taskId, Long userId) {
    log.info("Task 유저 작업 상세 조회 taskId:{}, userId: {}", taskId, userId);
    Task task = taskRepository.findById(taskId).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 작업없음 taskId: {}", taskId);
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.TASK_NOT_FOUND);
    });

    String locationName = locationRepository.findById(task.getLocationId()).orElseThrow(() -> {
      log.error("Task 유저 작업 상세 조회 실패: 지역없음 locationId: {}", task.getLocationId());
      return new ApiException(HttpStatus.NOT_FOUND.value(), ErrorMessage.LOCATION_NOT_FOUND);
    }).getName();

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

    return new TaskDetailResponseDto(taskId, locationName, d.getS3Url(), m.getS3Url(), v.getS3Url(),
        cracks,
        task.getActivatedAt());
  }
}
