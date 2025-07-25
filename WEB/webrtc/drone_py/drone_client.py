# drone_client.py (Python 3.11 및 최신 aiortc 호환 최종 버전)

import asyncio
import json
import logging
import numpy as np
import time
import fractions

from aiortc import (RTCIceCandidate, RTCPeerConnection,
                    RTCSessionDescription, VideoStreamTrack)
from ultralytics import YOLO
import cv2
import av
import websockets

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logging.getLogger("aiortc").setLevel(logging.WARNING)
logging.getLogger("websockets").setLevel(logging.WARNING)
logging.getLogger("ultralytics").setLevel(logging.WARNING)


# 실시간으로 웹캠 영상을 읽고 YOLOv8으로 처리하는 비디오 트랙 클래스
class YoloVideoStreamTrack(VideoStreamTrack):
    """
    aiortc 1.13.0 호환 YOLO 비디오 스트림 트랙
    VideoStreamTrack을 직접 상속하여 timestamp 문제 해결
    """

    def __init__(self, model_name='yolov8n.pt', cam_num=0, confidence_threshold=0.5):
        super().__init__()  # VideoStreamTrack 초기화
        self.confidence_threshold = confidence_threshold
        self.frame_count = 0
        
        # 수동 timestamp 관리
        self._timestamp = 0
        self._start_time = time.time()
        
        logging.info("YOLO 모델 로딩...")
        try:
            self.model = YOLO(model_name)
            # YOLO 모델 설정 최적화
            self.model.conf = confidence_threshold  # 신뢰도 임계값 설정
            self.model.iou = 0.45  # IoU 임계값 설정
            logging.info(f"YOLO 모델 로딩 완료: {model_name}")
        except Exception as e:
            logging.error(f"YOLO 모델 로딩 실패: {e}")
            raise
        
        logging.info("웹캠 초기화...")
        try:
            self.cap = cv2.VideoCapture(cam_num)
            if not self.cap.isOpened():
                raise IOError(f"웹캠 {cam_num}을 열 수 없습니다.")
            
            # 웹캠 설정 최적화
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # 버퍼 크기 최소화로 지연 시간 감소
            
            logging.info("웹캠 초기화 완료.")
        except Exception as e:
            logging.error(f"웹캠 초기화 실패: {e}")
            raise

    async def recv(self):
        """
        VideoStreamTrack.recv() 구현
        aiortc 1.13.0 호환 버전
        """
        try:
            # 수동 timestamp 생성 (30 FPS 기준)
            frame_time = 1 / 30.0  # 30 FPS
            pts = int(self._timestamp * 90000)  # 90kHz timebase
            time_base = fractions.Fraction(1, 90000)
            self._timestamp += frame_time
            
            # 비동기로 프레임 읽기 (블로킹 방지)
            success, frame = await asyncio.to_thread(self.cap.read)

            if not success or frame is None:
                if self.frame_count % 30 == 0:  # 30프레임마다 로깅
                    logging.warning("웹캠에서 프레임을 읽을 수 없습니다.")
                # 검은 화면 생성 (None 반환 방지)
                black_frame = self._create_black_frame()
                black_frame.pts = pts
                black_frame.time_base = time_base
                return black_frame
            
            self.frame_count += 1
            
            # YOLO 객체 인식 수행
            try:
                # verbose=False로 로그 출력 최소화, 성능 향상을 위해 비동기 처리
                results = await asyncio.to_thread(self.model, frame, verbose=False)
                
                # 인식 결과를 프레임에 그리기
                annotated_frame = results[0].plot(
                    line_width=2,  # 박스 라인 두께
                    font_size=12,  # 텍스트 크기
                    labels=True,   # 라벨 표시
                    conf=True      # 신뢰도 표시
                )
                
                # 감지된 객체 정보 로깅 (주기적으로)
                if self.frame_count % 60 == 0:  # 60프레임마다 (2초마다)
                    detections = results[0].boxes
                    if detections is not None and len(detections) > 0:
                        detected_classes = [self.model.names[int(cls)] for cls in detections.cls]
                        confidence_scores = [f"{conf:.2f}" for conf in detections.conf]
                        logging.info(f"🎯 감지된 객체 ({len(detections)}개): {dict(zip(detected_classes, confidence_scores))}")
                    else:
                        logging.info("📹 프레임 처리 중... (객체 미감지)")
                
                # OpenCV 프레임을 WebRTC용 VideoFrame으로 변환
                new_frame = av.VideoFrame.from_ndarray(annotated_frame, format="bgr24")
                new_frame.pts = pts
                new_frame.time_base = time_base
                return new_frame
                
            except Exception as yolo_error:
                if self.frame_count % 30 == 0:  # 30프레임마다 로깅
                    logging.warning(f"YOLO 처리 중 오류: {yolo_error}")
                # YOLO 처리 실패 시 원본 프레임 반환 (None 반환 방지)
                fallback_frame = av.VideoFrame.from_ndarray(frame, format="bgr24")
                fallback_frame.pts = pts
                fallback_frame.time_base = time_base
                return fallback_frame
                
        except Exception as e:
            logging.error(f"비디오 스트림 처리 중 오류: {e}")
            # 에러 발생 시에도 유효한 프레임 반환 (None 반환 방지)
            try:
                pts = int(self._timestamp * 90000)
                time_base = fractions.Fraction(1, 90000)
                self._timestamp += 1 / 30.0
                
                error_frame = self._create_black_frame()
                error_frame.pts = pts
                error_frame.time_base = time_base
                return error_frame
            except:
                # 최후의 수단: 기본 검은 프레임
                return self._create_black_frame()

    def _create_black_frame(self):
        """검은 화면 프레임 생성 (에러 방지용)"""
        black_image = np.zeros((480, 640, 3), dtype=np.uint8)
        # 에러 메시지를 화면에 표시
        cv2.putText(black_image, "Camera Initializing...", (50, 240), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        return av.VideoFrame.from_ndarray(black_image, format="bgr24")

    def stop(self):
        super().stop()
        try:
            if hasattr(self, 'cap') and self.cap.isOpened():
                self.cap.release()
                logging.info("웹캠 리소스를 해제했습니다.")
        except Exception as e:
            logging.warning(f"웹캠 해제 중 오류: {e}")
        
        # 통계 출력
        if hasattr(self, 'frame_count'):
            runtime = time.time() - self._start_time
            fps = self.frame_count / runtime if runtime > 0 else 0
            logging.info(f"📊 처리 완료: {self.frame_count}프레임, 평균 FPS: {fps:.1f}")

    # YOLO 설정 동적 변경 메서드 추가
    def update_confidence_threshold(self, threshold):
        """신뢰도 임계값 동적 변경"""
        self.confidence_threshold = threshold
        self.model.conf = threshold
        logging.info(f"신뢰도 임계값 변경: {threshold}")
    
    def get_model_info(self):
        """모델 정보 반환"""
        return {
            "model_name": str(self.model.model.yaml_file) if hasattr(self.model.model, 'yaml_file') else "Unknown",
            "classes": list(self.model.names.values()),
            "confidence_threshold": self.confidence_threshold,
            "processed_frames": self.frame_count
        }

async def run():
    pc = RTCPeerConnection()

    video_track = None
    try:
        # 개선된 YOLO 비디오 트랙 생성 (사용자 제공 코드 기반 최적화)
        video_track = YoloVideoStreamTrack(
            model_name='yolov8n.pt',  # YOLO 모델 파일
            cam_num=0,                # 웹캠 번호 (0은 기본 웹캠)
            confidence_threshold=0.5   # 객체 인식 신뢰도 임계값
        )
        
        # 모델 정보 출력
        model_info = video_track.get_model_info()
        logging.info(f"YOLO 모델 정보: {model_info['model_name']}")
        logging.info(f"인식 가능한 클래스 수: {len(model_info['classes'])}")
        logging.info(f"신뢰도 임계값: {model_info['confidence_threshold']}")
        
        pc.addTrack(video_track)

        async with websockets.connect("ws://localhost:8080") as websocket:
            logging.info("시그널링 서버에 연결되었습니다.")

            offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            logging.info("Offer를 전송합니다...")
            await websocket.send(json.dumps({
                "type": "offer",
                "offer": {"type": offer.type, "sdp": offer.sdp}
            }))

            async for message in websocket:
                data = json.loads(message)
                logging.info(f"시그널링 메시지 수신: {data['type']}")

                if data["type"] == "answer":
                    answer = RTCSessionDescription(sdp=data["answer"]["sdp"], type=data["answer"]["type"])
                    await pc.setRemoteDescription(answer)
                    logging.info("Answer를 수신하고 연결 설정을 완료했습니다.")

                elif data["type"] == "candidate":
                    candidate_data = data.get("candidate")
                    if candidate_data:
                        try:
                            # [최종 수정] aiortc 1.13.0에서 RTCIceCandidate 올바른 생성 방법
                            # candidate 문자열에서 필요한 정보를 파싱
                            candidate_str = candidate_data.get("candidate", "")
                            if candidate_str:
                                # candidate 문자열 파싱 (예: "candidate:foundation component protocol priority ip port typ type")
                                parts = candidate_str.split()
                                if len(parts) >= 8:
                                    foundation = parts[0].split(':')[1] if ':' in parts[0] else parts[0]
                                    component = int(parts[1])
                                    protocol = parts[2].lower()
                                    priority = int(parts[3])
                                    ip = parts[4]
                                    port = int(parts[5])
                                    type_str = parts[7]  # parts[6]은 "typ"
                                    
                                    candidate = RTCIceCandidate(
                                        foundation=foundation,
                                        component=component,
                                        protocol=protocol,
                                        priority=priority,
                                        ip=ip,
                                        port=port,
                                        type=type_str,
                                        sdpMid=candidate_data.get("sdpMid"),
                                        sdpMLineIndex=candidate_data.get("sdpMLineIndex")
                                    )
                                    await pc.addIceCandidate(candidate)
                                    logging.info(f"Candidate를 성공적으로 추가했습니다: {ip}:{port} ({type_str})")
                                else:
                                    logging.warning(f"Invalid candidate format: {candidate_str}")
                            else:
                                logging.warning("Empty candidate string")
                        except Exception as e:
                            logging.warning(f"Candidate 추가 실패: {e}")
                            logging.debug(f"Candidate data: {candidate_data}")
                    else:
                        # end-of-candidates marker
                        try:
                            await pc.addIceCandidate(None)
                            logging.info("End-of-candidates 마커를 처리했습니다.")
                        except Exception as e:
                            logging.warning(f"End-of-candidates 처리 실패: {e}")

            logging.info("🚀 실시간 YOLO 객체인식 스트리밍 시작! 웹 브라우저를 확인하세요.")
            logging.info("💡 감지 가능한 객체: 사람, 자동차, 자전거, 개, 고양이, 새, 등 80가지 클래스")
            # 스크립트가 바로 종료되지 않도록 대기
            await asyncio.Event().wait()

    except (ConnectionRefusedError, asyncio.TimeoutError, websockets.exceptions.ConnectionClosedError):
        logging.error("❌ 시그널링 서버 연결에 실패했습니다. 서버가 실행 중인지 확인하세요.")
        logging.info("💡 해결방법: server_js 폴더에서 'node server.js'를 먼저 실행하세요.")
    except IOError as e:
        logging.error(f"❌ 미디어 장치 에러: {e}")
        logging.info("💡 해결방법: 웹캠이 다른 프로그램에서 사용 중이지 않은지 확인하세요.")
    except Exception as e:
        logging.error(f"❌ 예상치 못한 에러 발생: {e}", exc_info=True)
    finally:
        if video_track:
            video_track.stop()
            # 최종 통계 출력
            final_info = video_track.get_model_info()
            logging.info(f"📊 처리 완료: 총 {final_info['processed_frames']}개 프레임 처리됨")
        if pc.connectionState != "closed":
            await pc.close()
            logging.info("🔌 PeerConnection을 종료했습니다.")


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        logging.info("사용자에 의해 프로그램이 종료되었습니다.")
        pass