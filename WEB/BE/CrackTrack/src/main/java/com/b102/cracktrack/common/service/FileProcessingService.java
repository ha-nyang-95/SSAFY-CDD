package com.b102.cracktrack.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileProcessingService {

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.region.static}")
    private String awsRegion;

    /**
     * Lambda 이벤트로 받은 UUID와 균열 개수로 S3 퍼블릭 버킷 URL을 생성합니다.
     * 
     * @param uuid UUID (예: u1/3109d467-8428-487e-964f-bf9ceda023f4)
     * @param crackCount 균열 개수
     * @return 생성된 S3 URL 목록
     */
    @Transactional
    public List<String> generateS3Urls(String uuid, int crackCount) {
        log.info("S3 URL 생성 시작 - uuid: {}, crackCount: {}", uuid, crackCount);
        
        List<String> s3Urls = new ArrayList<>();
        
        // 기본 자산 URL 생성 (영상, 디텍팅, 모델링)
        s3Urls.add(generateS3Url(uuid, "raw_video.mp4"));
        s3Urls.add(generateS3Url(uuid, "detect.mp4"));  // 디텍션 비디오 파일
        s3Urls.add(generateS3Url(uuid, "model.splat"));
        
        // 균열별 자산 URL 생성 (세그먼트, 이미지, 라이더)
        for (int i = 1; i <= crackCount; i++) {
            String crackId = String.format("crack_%03d", i);
            String crackPath = "crack_num/" + crackId;
            
            s3Urls.add(generateS3Url(uuid, crackPath + "/segment.png"));
            s3Urls.add(generateS3Url(uuid, crackPath + "/image.jpeg"));
            s3Urls.add(generateS3Url(uuid, crackPath + "/lidar.json"));
        }
        
        log.info("S3 URL 생성 완료 - uuid: {}, crackCount: {}, 총 URL 개수: {}", uuid, crackCount, s3Urls.size());
        return s3Urls;
    }

    /**
     * S3 퍼블릭 버킷 URL을 생성합니다.
     * 
     * @param uuid UUID
     * @param fileName 파일명
     * @return S3 퍼블릭 URL
     */
    public String generateS3Url(String uuid, String fileName) {
        String fullPath = uuid + "/" + fileName;
        String url = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion, fullPath);
        log.debug("S3 URL 생성: {}", url);
        return url;
    }
}
