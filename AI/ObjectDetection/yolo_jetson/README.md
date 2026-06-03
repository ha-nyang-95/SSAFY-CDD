# YOLO on Jetson (실시간 객체 탐지)

드론에 탑재된 **Jetson Orin Nano**에서 카메라 영상을 **YOLOv8n** 모델로 실시간 추론하고, 그 영상을 **WebRTC**로 웹 뷰어에 전송하기 위한 모듈입니다. WebSocket 시그널링 서버를 통해 드론(스트림 송신자)과 뷰어(브라우저) 간 P2P 연결을 수립합니다.

</br>

## 🐍 실행 환경

- **Python 3.11.0**
- 의존성 (`requirements.txt`)
  - `ultralytics` — YOLOv8 추론
  - `opencv-python` — 카메라 캡처 및 시각화
- WebRTC 스트리밍 스크립트(`server.py`, `drone_client.py`)는 추가로 `websockets`, `aiortc`, `av`가 필요합니다.

```bash
pip install ultralytics opencv-python
pip install websockets aiortc av   # WebRTC 스트리밍용
```

</br>

## 📂 스크립트 구성

| 파일 | 역할 |
|------|------|
| `live_object_detect.py` | `detect_object_Yolo(model_name, cam_num)` 함수 정의. OpenCV로 카메라 프레임을 읽어 YOLOv8n으로 추론하고 결과를 화면에 표시 |
| `jsetson_yolo.py` | Jetson Orin Nano 보드에서 실행하는 진입점. `live_object_detect`를 임포트해 `yolov8n.pt` 모델, 카메라 0번으로 실시간 탐지 실행 |
| `server.py` | WebSocket 시그널링 서버(`ws://0.0.0.0:8765`). `drone`과 `viewer` 역할을 등록받아 SDP/ICE 메시지를 양쪽에 중계 |
| `drone_client.py` | 드론 측 WebRTC 클라이언트. 시그널링 서버에 `drone`으로 등록하고 비디오 트랙을 송출(Offer 생성·전송, Answer/ICE 처리) |
| `viewer.html` | 브라우저 뷰어. `viewer`로 등록 후 WebRTC로 드론 영상을 수신·재생 |

> 참고: 현재 `drone_client.py`의 비디오 트랙은 테스트 패턴(`TestPatternVideoTrack`)으로 구성되어 있으며, 실제 운용 시 YOLO 추론 프레임을 송출하는 트랙으로 교체해 사용합니다.

</br>

## ▶️ 실행 순서

### 1) Jetson 보드 단독 실시간 탐지

```bash
python jsetson_yolo.py
# 내부적으로 detect_object_Yolo('yolov8n.pt', 0) 실행
# 'q' 키로 종료
```

### 2) WebRTC 스트리밍 (드론 → 웹 뷰어)

```bash
# 1. 시그널링 서버 실행 (ws://0.0.0.0:8765)
python server.py

# 2. 드론 클라이언트 실행 (drone 역할로 등록 후 영상 송출)
python drone_client.py

# 3. viewer.html 을 브라우저로 열어 영상 수신
#    (기본 시그널링 주소: ws://127.0.0.1:8765)
```

드론과 뷰어가 모두 등록되면 서버가 뷰어에 `drone_ready`를 통지하고, WebRTC Offer/Answer 및 ICE candidate 교환을 거쳐 P2P 영상 스트림이 연결됩니다.
