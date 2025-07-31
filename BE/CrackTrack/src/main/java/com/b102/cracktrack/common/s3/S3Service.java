package com.b102.cracktrack.common.s3;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.UUID;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

  private final S3Client s3Client;
  private final S3Presigner s3Presigner;

  @Value("${cloud.aws.s3.bucket}")
  private String bucketName;

  /**
   * S3에 파일 업로드 후, 저장된 S3 Key(또는 URL) 반환
   */
  public String uploadFile(MultipartFile file) {
    String key = generateUniqueFileName(file.getOriginalFilename());
    try {
      PutObjectRequest putObjectRequest = PutObjectRequest.builder()
          .bucket(bucketName)
          .key(key)
          .contentType(file.getContentType())
          .build();

      s3Client.putObject(
          putObjectRequest,
          software.amazon.awssdk.core.sync.RequestBody.fromInputStream(file.getInputStream(), file.getSize())
      );

      return key;
//       return getFileUrl(key); // URL을 반환하려면 아래 유틸 함수 활용
    } catch (IOException e) {
      throw new RuntimeException("S3 파일 업로드 실패", e);
    }
  }
  public void deleteFile(String key) {
    DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .build();
    s3Client.deleteObject(deleteObjectRequest);
  }

  /**
   * S3에 저장된 파일의 Key로 URL 반환 (퍼블릭 버킷일 때만 사용)
   */
  public String getFileUrl(String key) {
    return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
  }

  /**
   *  S3가 프라이빗 설정이라면 해당 메서드로 presignedUrl을 발급받아야함
   */
  public String generatePresignedUrl(String key){
    GetObjectRequest getObjectRequest = GetObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .build();

    GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(10))// 3분정도로 제한
        .getObjectRequest(getObjectRequest)
        .build();
    return s3Presigner.presignGetObject(presignRequest).url().toString();
  }

  /**
   * 파일명 중복 방지를 위한 유니크 파일명 생성
   */
  private String generateUniqueFileName(String originalFilename) {
    return UUID.randomUUID() + "_" + originalFilename;
  }


}

