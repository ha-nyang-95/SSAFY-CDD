package com.b102.cracktrack.domain.ivs.processor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.ivs.IvsClient;
import software.amazon.awssdk.services.ivs.model.*;

/**
 * AWS IVS에 접근하여 채널 생성 및 키 발급을 관리하는 로직 service 단은 백엔드에서 관리를 위한 로직을 담당
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class IvsChannelProcessor {

  private final IvsClient ivsClient;

  @Value("${aws.ivs.recording.config.arn}")
  private String recordingConfig;

  /**
   * //   * @param recordingConfig IVS에서 지정해놓은 화면 녹화 구성 세팅
   * @param channelName IVS 채널 명 서비스에서는 모델명으로 작성
   * @return IVS채널 객체 반환 채널 타입은 초저지연을 목표로 ADVANCED_SD사용
   */
  public Channel createChannel(String channelName) {
    if (recordingConfig == null || recordingConfig.isBlank()) {
      throw new IllegalStateException("레코딩 구성 ARN이 설정되어 있지 않습니다.");
    }
    CreateChannelRequest.Builder builder = CreateChannelRequest.builder()
        .name(channelName)
        .recordingConfigurationArn(recordingConfig)
        .type(ChannelType.ADVANCED_SD);
    log.info("[AWS] IVS 채널 생성 성공");

    CreateChannelResponse response = ivsClient.createChannel(builder.build());
    return response.channel();
  }

  /**
   * 스트림 키 드론의 영상을 보내기 위한 채널 접근
   * @param channelArn 채널ARN(고유 ID값)
   * @return 스트림 키(영상 송출을 위해 드론에게 줘야함)
   */
  public StreamKey createStreamKey(String channelArn) {
    CreateStreamKeyResponse response = ivsClient.createStreamKey(
        CreateStreamKeyRequest.builder()
            .channelArn(channelArn)
            .build()
    );
    log.info("[AWS] IVS 채널 스트림키 발급 성공");
    return response.streamKey();
  }

  /**
   * 채널 삭제
   * 보안 상 이유로 한번의 송출이 끝나면 삭제
   * 스트림키 먼저 삭제 이후에 채널 삭제
   * @param channelArn 삭제할 서버의 ARN
   */
  public void deleteChannel(String channelArn) {
    ivsClient.deleteChannel(DeleteChannelRequest.builder()
        .arn(channelArn)
        .build());
    log.info("[AWS] IVS 채널 삭제 성공");
  }


  /**
   * 스트림 키 삭제
   * 현재는 보안상의 이유로 한번의 송출이 끝나면 삭제로 종료
   * @param streamKeyArn 삭제할 채널의 ARN
   */
  public void deleteStreamKey(String streamKeyArn){
    ivsClient.deleteStreamKey(DeleteStreamKeyRequest.builder()
        .arn(streamKeyArn)
        .build());
    log.info("[AWS] IVS 채널 스트림키 삭제 성공");
  }
}
