package com.b102.cracktrack.common.service;

import com.b102.cracktrack.common.util.FileTypeParser;
import com.b102.cracktrack.domain.detection.service.DetectionService;
import com.b102.cracktrack.domain.image.service.ImageService;
import com.b102.cracktrack.domain.lidar.service.LidarService;
import com.b102.cracktrack.domain.modeling.service.ModelingService;
import com.b102.cracktrack.domain.segment.service.SegmentService;
import com.b102.cracktrack.domain.task.entity.Task;
import com.b102.cracktrack.domain.video.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileProcessingService {

    private final DetectionService detectionService;
    private final VideoService videoService;
    private final ModelingService modelingService;
    private final ImageService imageService;
    private final LidarService lidarService;
    private final SegmentService segmentService;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * 파일 타입에 따라 적절한 서비스를 호출하여 파일을 생성합니다.
     * 
     * @param task 작업 정보
     * @param fileName 파일명
     * @param fileType 파일 타입
     */
    public void createFileByType(Task task, String fileName, String fileType) {
        log.info("파일 생성 시작 - taskId: {}, fileName: {}, fileType: {}", 
            task.getTaskId(), fileName, fileType);

        try {
            switch (fileType) {
                case FileTypeParser.TYPE_VIDEO:
                    videoService.createVideo(task.getTaskId(), fileName);
                    break;
                case FileTypeParser.TYPE_DETECTION:
                    detectionService.createDetection(task.getTaskId(), fileName);
                    break;
                case FileTypeParser.TYPE_MODELING:
                    modelingService.createModeling(task.getTaskId(), fileName);
                    break;
                case FileTypeParser.TYPE_SEGMENT:
                    String segmentCrackId = FileTypeParser.extractCrackId(fileName);
                    segmentService.createSegment(task.getTaskId(), fileName, segmentCrackId);
                    break;
                case FileTypeParser.TYPE_IMAGE:
                    String imageCrackId = FileTypeParser.extractCrackId(fileName);
                    imageService.createImage(task.getTaskId(), fileName, imageCrackId);
                    break;
                case FileTypeParser.TYPE_LIDAR:
                    String lidarCrackId = FileTypeParser.extractCrackId(fileName);
                    lidarService.createLidar(task.getTaskId(), fileName, lidarCrackId);
                    break;
                default:
                    log.warn("알 수 없는 파일 타입: {} - fileName: {}", fileType, fileName);
                    break;
            }
            
            log.info("파일 생성 완료 - taskId: {}, fileName: {}, fileType: {}", 
                task.getTaskId(), fileName, fileType);
                
        } catch (Exception e) {
            log.error("파일 생성 실패 - taskId: {}, fileName: {}, fileType: {}, error: {}", 
                task.getTaskId(), fileName, fileType, e.getMessage());
            throw e;
        }
    }

    /**
     * 기본 자산 파일들을 생성합니다 (비디오, 디텍션, 모델링)
     */
    public void createBasicAssets(Task task) {
        log.info("기본 자산 파일 생성 시작 - taskId: {}", task.getTaskId());
        
        // 비디오 파일 생성
        createFileByType(task, "raw_video.mp4", FileTypeParser.TYPE_VIDEO);
        
        // 디텍션 파일 생성
        createFileByType(task, "detected_video.mp4", FileTypeParser.TYPE_DETECTION);
        
        // 모델링 파일 생성
        createFileByType(task, "model.splat", FileTypeParser.TYPE_MODELING);
        
        log.info("기본 자산 파일 생성 완료 - taskId: {}", task.getTaskId());
    }

    /**
     * 균열별 파일들을 생성합니다 (이미지, 세그먼트, 라이더)
     */
    public void createCrackAssets(Task task, int crackCount) {
        log.info("균열 관련 파일 생성 시작 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
        
        for (int i = 1; i <= crackCount; i++) {
            String crackIdString = String.format("crack_%03d", i);
            
            // 세그먼트 파일 생성
            createFileByType(task, crackIdString + "/segment.png", FileTypeParser.TYPE_SEGMENT);
            
            // 이미지 파일 생성
            createFileByType(task, crackIdString + "/image.jpeg", FileTypeParser.TYPE_IMAGE);
            
            // 라이더 파일 생성
            createFileByType(task, crackIdString + "/lidar.json", FileTypeParser.TYPE_LIDAR);
        }
        
        log.info("균열 관련 파일 생성 완료 - taskId: {}, crackCount: {}", task.getTaskId(), crackCount);
    }
}
