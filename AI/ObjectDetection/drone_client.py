import asyncio
import json
import logging
import websockets
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from aiortc.contrib.media import MediaPlayer, MediaStreamTrack
from av import VideoFrame
import time
import fractions

# 로깅 설정
logging.basicConfig(level=logging.INFO)

# 테스트용 비디오 트랙 클래스 (카메라 대신 사용)
class TestPatternVideoTrack(MediaStreamTrack):
    """
    A video track that returns a moving test pattern.
    """
    kind = "video"

    def __init__(self):
        super().__init__()  # 이것이 중요합니다
        self.frame_count = 0
        self.width = 640
        self.height = 480
        self._timestamp = 0
        self._start = None

    async def recv(self) -> VideoFrame:
        # 올바른 타임스탬프 생성
        if self._start is None:
            self._start = time.time()
        
        now = time.time()
        elapsed = now - self._start
        
        # 30 FPS로 프레임 생성
        frame_time = self.frame_count / 30.0
        if elapsed < frame_time:
            await asyncio.sleep(frame_time - elapsed)

        # 간단한 테스트 패턴 생성 (움직이는 사각형)
        img = bytearray(self.width * self.height * 3)
        x_pos = (self.frame_count * 10) % self.width
        y_pos = (self.frame_count * 5) % self.height
        
        for y in range(self.height):
            for x in range(self.width):
                idx = (y * self.width + x) * 3
                if x_pos <= x < x_pos + 50 and y_pos <= y < y_pos + 50:
                    # Blue square
                    img[idx] = 255
                    img[idx + 1] = 0
                    img[idx + 2] = 0
                else:
                    # White background
                    img[idx] = 255
                    img[idx + 1] = 255
                    img[idx + 2] = 255

        frame = VideoFrame.from_bytes(bytes(img), width=self.width, height=self.height, format="bgr24")
        
        # 올바른 타임스탬프 설정
        frame.pts = self.frame_count
        frame.time_base = fractions.Fraction(1, 30)  # 30 FPS
        
        self.frame_count += 1
        return frame

async def run():
    # aiortc용 RTCPeerConnection 설정
    ice_servers = [
        RTCIceServer(urls=["stun:stun.l.google.com:19302"]),
        RTCIceServer(urls=["stun:stun1.l.google.com:19302"])
    ]
    configuration = RTCConfiguration(iceServers=ice_servers)
    pc = RTCPeerConnection(configuration=configuration)
    
    # ICE candidate 수집을 위한 변수
    ice_gathering_complete = asyncio.Event()
    
    # RTCPeerConnection 이벤트 핸들러
    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        logging.info(f"ICE connection state is {pc.iceConnectionState}")
        if pc.iceConnectionState == "connected":
            logging.info("ICE connection established!")

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        logging.info(f"Connection state is {pc.connectionState}")

    @pc.on("icegatheringstatechange")
    async def on_icegatheringstatechange():
        logging.info(f"ICE gathering state is {pc.iceGatheringState}")
        if pc.iceGatheringState == "complete":
            ice_gathering_complete.set()

    try:
        async with websockets.connect("ws://127.0.0.1:8765") as websocket:
            # 1. 서버에 'drone'으로 등록
            register_msg = {"type": "register", "role": "drone"}
            await websocket.send(json.dumps(register_msg))
            logging.info("Registered with signaling server as drone.")
            
            # 등록 확인 메시지 받기
            response = await websocket.recv()
            response_data = json.loads(response)
            if response_data.get("type") != "registered":
                logging.error(f"Registration failed: {response_data}")
                return
            
            # 2. 비디오 트랙 추가
            video_track = TestPatternVideoTrack()
            pc.addTrack(video_track)

            # 3. WebRTC Offer 생성 및 전송
            offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            
            # ICE candidate 수집이 완료될 때까지 잠시 기다림 (선택사항)
            try:
                await asyncio.wait_for(ice_gathering_complete.wait(), timeout=5.0)
                logging.info("ICE gathering completed")
            except asyncio.TimeoutError:
                logging.info("ICE gathering timeout, proceeding anyway")
            
            message = {
                "type": pc.localDescription.type,
                "sdp": pc.localDescription.sdp,
            }
            await websocket.send(json.dumps(message))
            logging.info("Sent offer to viewer.")

            # 4. 서버로부터 응답(answer)을 기다림
            answer_received = False
            timeout_seconds = 60  # 타임아웃을 60초로 증가
            while not answer_received:
                try:
                    message_str = await asyncio.wait_for(websocket.recv(), timeout=timeout_seconds)
                    message = json.loads(message_str)

                    if message["type"] == "answer":
                        logging.info("Received answer from viewer.")
                        answer = RTCSessionDescription(sdp=message["sdp"], type=message["type"])
                        await pc.setRemoteDescription(answer)
                        answer_received = True
                        break
                    elif message["type"] == "ice_candidate" and message.get("candidate"):
                        try:
                            # aiortc의 경우 addIceCandidate는 candidate object를 직접 받습니다
                            if hasattr(message["candidate"], "candidate"):
                                await pc.addIceCandidate(message["candidate"])
                            else:
                                # 브라우저에서 오는 candidate 형식을 aiortc 형식으로 변환
                                candidate = RTCIceCandidate(
                                    component=message["candidate"].get("component", 1),
                                    foundation=message["candidate"].get("foundation", ""),
                                    ip=message["candidate"].get("address", ""),
                                    port=message["candidate"].get("port", 0),
                                    priority=message["candidate"].get("priority", 0),
                                    protocol=message["candidate"].get("protocol", "udp"),
                                    type=message["candidate"].get("type", "host"),
                                )
                                await pc.addIceCandidate(candidate)
                            logging.info("Added ICE candidate")
                        except Exception as e:
                            logging.warning(f"Failed to add ICE candidate: {e}")
                    else:
                        logging.info(f"Received other message type: {message.get('type')}")
                except asyncio.TimeoutError:
                    logging.warning(f"Timeout waiting for answer from viewer ({timeout_seconds}s)")
                    break
                except websockets.exceptions.ConnectionClosed:
                    logging.warning("Connection to signaling server closed.")
                    break
                except json.JSONDecodeError as e:
                    logging.error(f"Invalid JSON received: {e}")
                    break
            
            if answer_received:
                logging.info("Connection established. Streaming video...")
                
                # 연결 상태를 주기적으로 확인
                connection_timeout = 300  # 5분으로 증가
                start_time = time.time()
                
                while (pc.connectionState not in ["failed", "closed"] and 
                       (time.time() - start_time) < connection_timeout):
                    await asyncio.sleep(2)  # 2초마다 체크
                    
                    # 연결 상태 주기적 로깅 (30초마다)
                    if int(time.time() - start_time) % 30 == 0:
                        logging.info(f"Streaming... Connection: {pc.connectionState}, ICE: {pc.iceConnectionState}")
                    
                if pc.connectionState == "failed":
                    logging.error("WebRTC connection failed")
                elif (time.time() - start_time) >= connection_timeout:
                    logging.info("Connection timeout reached")
            else:
                logging.error("Failed to receive answer from viewer")
                
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 정리
        await pc.close()
        logging.info("PeerConnection closed")

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        logging.info("Interrupted by user")
    except Exception as e:
        logging.error(f"Application error: {e}")