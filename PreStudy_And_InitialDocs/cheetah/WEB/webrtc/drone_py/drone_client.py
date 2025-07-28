# drone_client.py (TypeError 최종 해결 버전)

import asyncio
import json
import logging
import numpy as np
import time
import fractions
import re

from aiortc import (RTCIceCandidate, RTCPeerConnection, RTCSessionDescription,
                    VideoStreamTrack, RTCConfiguration, RTCIceServer)
from ultralytics import YOLO
import cv2
import av
import websockets

# --- 설정 ---
SIGNALING_SERVER_URL = "ws://shyo2.com:8080"
ICE_SERVERS = [
    RTCIceServer(urls=["stun:stun.l.google.com:19302"]),
    RTCIceServer(
        urls=["turn:numb.viagenie.ca?transport=tcp"],
        username="webrtc@live.com",
        credential="muazkh",
    ),
]
YOLO_MODEL_NAME = 'yolov8n.pt'
WEBCAM_DEVICE = 0
CONFIDENCE_THRESHOLD = 0.5
# -----------

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.getLogger("aiortc").setLevel(logging.WARNING)
logging.getLogger("websockets").setLevel(logging.WARNING)
logging.getLogger("ultralytics").setLevel(logging.WARNING)


# [수정 1] Candidate 문자열 파싱을 위한 헬퍼 함수 추가
def parse_candidate(candidate_str):
    """
    "a=candidate:" 문자열을 파싱하여 aiortc가 요구하는 형식의 dict로 변환합니다.
    """
    # "a=candidate:" 또는 "candidate:" 접두사 제거
    if candidate_str.startswith("a=candidate:"):
        candidate_str = candidate_str[len("a=candidate:"):]
    elif candidate_str.startswith("candidate:"):
        candidate_str = candidate_str[len("candidate:"):]

    parts = candidate_str.split()
    if len(parts) < 8:
        return None

    # 필수 필드 추출
    candidate_info = {
        'foundation': parts[0],
        'component': int(parts[1]),
        'protocol': parts[2].lower(),
        'priority': int(parts[3]),
        'ip': parts[4],
        'port': int(parts[5]),
        'type': parts[7],
    }
    return candidate_info

class YoloVideoStreamTrack(VideoStreamTrack):
    # 이 클래스는 변경 사항 없음
    def __init__(self, model_name, cam_num, confidence_threshold):
        super().__init__()
        self.confidence_threshold = confidence_threshold
        self.frame_count = 0
        self._timestamp = 0
        logging.info("YOLO 모델 로딩...")
        try:
            self.model = YOLO(model_name)
            self.model.conf = confidence_threshold
            self.model.iou = 0.45
            logging.info(f"YOLO 모델 로딩 완료: {model_name}")
        except Exception as e:
            logging.error(f"YOLO 모델 로딩 실패: {e}")
            raise
        logging.info("웹캠 초기화...")
        try:
            self.cap = cv2.VideoCapture(cam_num, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                raise IOError(f"웹캠 {cam_num}을 열 수 없습니다.")
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            logging.info("웹캠 초기화 완료.")
        except Exception as e:
            logging.error(f"웹캠 초기화 실패: {e}")
            raise

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        try:
            success, frame = await asyncio.to_thread(self.cap.read)
            if not success or frame is None:
                return self._create_black_frame(pts, time_base)
            self.frame_count += 1
            results = await asyncio.to_thread(self.model, frame, verbose=False)
            annotated_frame = results[0].plot()
            if self.frame_count % 90 == 0:
                self._log_detections(results)
            new_frame = av.VideoFrame.from_ndarray(annotated_frame, format="bgr24")
            new_frame.pts = pts
            new_frame.time_base = time_base
            return new_frame
        except Exception as e:
            logging.error(f"비디오 스트림 처리 중 오류 발생: {e}")
            return self._create_black_frame(pts, time_base)

    async def next_timestamp(self):
        if hasattr(self, 'stopped') and self.stopped:
            pts = self._timestamp
        else:
            now = time.time()
            if not hasattr(self, "_start_time"):
                self._start_time = now
            self._timestamp = int((now - self._start_time) * 90000)
        pts = self._timestamp
        time_base = fractions.Fraction(1, 90000)
        return pts, time_base

    def _create_black_frame(self, pts, time_base):
        black_image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.putText(black_image, "Stream Error", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        frame = av.VideoFrame.from_ndarray(black_image, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame

    def _log_detections(self, results):
        detections = results[0].boxes
        if detections and len(detections) > 0:
            detected_classes = [self.model.names[int(cls)] for cls in detections.cls]
            logging.info(f"🎯 감지된 객체 ({len(detections)}개): {', '.join(detected_classes)}")
        else:
            logging.info("📹 프레임 처리 중... (객체 미감지)")

    def stop(self):
        if not hasattr(self, 'stopped') or not self.stopped:
            self.stopped = True
            if hasattr(self, 'cap') and self.cap.isOpened():
                self.cap.release()
                logging.info("웹캠 리소스를 해제했습니다.")
            super().stop()


async def run():
    configuration = RTCConfiguration(iceServers=ICE_SERVERS)
    pc = RTCPeerConnection(configuration=configuration)
    video_track = None
    websocket = None
    
    try:
        video_track = YoloVideoStreamTrack(YOLO_MODEL_NAME, WEBCAM_DEVICE, CONFIDENCE_THRESHOLD)
        pc.addTrack(video_track)

        @pc.on("icecandidate")
        async def on_icecandidate(candidate):
            if candidate and websocket and websocket.open:
                await websocket.send(json.dumps({
                    "type": "candidate", "candidate": candidate.to_dict(),
                }))

        websocket = await websockets.connect(SIGNALING_SERVER_URL)
        logging.info("시그널링 서버에 연결되었습니다.")

        offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        logging.info("Offer를 전송합니다...")
        await websocket.send(json.dumps({
            "type": "offer", "offer": {"type": offer.type, "sdp": offer.sdp}
        }))

        async for message in websocket:
            data = json.loads(message)
            msg_type = data.get("type")
            
            if msg_type == "answer":
                logging.info("시그널링 메시지 수신: answer")
                answer = RTCSessionDescription(sdp=data["answer"]["sdp"], type=data["answer"]["type"])
                await pc.setRemoteDescription(answer)
                logging.info("Answer를 수신하고 연결 설정을 완료했습니다.")
            
            elif msg_type == "candidate":
                # [수정 2] 파싱 함수를 사용하여 Candidate 처리
                candidate_data = data.get("candidate")
                if candidate_data and candidate_data.get("candidate"):
                    # 헬퍼 함수로 문자열 파싱
                    parsed_info = parse_candidate(candidate_data["candidate"])
                    
                    if parsed_info:
                        # 파싱된 정보와 sdpMid, sdpMLineIndex 결합
                        full_candidate_info = {
                            **parsed_info,
                            "sdpMid": candidate_data.get("sdpMid"),
                            "sdpMLineIndex": candidate_data.get("sdpMLineIndex"),
                        }
                        
                        try:
                            candidate = RTCIceCandidate(**full_candidate_info)
                            await pc.addIceCandidate(candidate)
                            logging.info(f"원격 Candidate 추가 성공: {candidate.type} ({candidate.ip}:{candidate.port})")
                        except Exception as e:
                            logging.warning(f"파싱된 Candidate 추가 실패: {e}")
                    else:
                        logging.warning(f"Candidate 문자열 파싱 실패: {candidate_data['candidate']}")

        await asyncio.Event().wait()

    except Exception as e:
        logging.error(f"❌ 실행 중 에러 발생: {e}", exc_info=True)
    finally:
        logging.info("...프로그램을 종료합니다...")
        if video_track:
            video_track.stop()
        if 'pc' in locals() and pc.connectionState != "closed":
            await pc.close()
            logging.info("🔌 PeerConnection을 종료했습니다.")
        if 'websocket' in locals() and websocket.open:
            await websocket.close()
            logging.info("🔌 시그널링 연결을 종료했습니다.")


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        pass
    finally:
        logging.info("프로그램이 완전히 종료되었습니다.")