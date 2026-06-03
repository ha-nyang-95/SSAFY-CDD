# WEB / webrtc (사전조사 PoC)

WebRTC 기반으로 **드론 영상을 브라우저로 실시간 스트리밍**하는 기술 검증(PoC) 자료입니다. Node.js WebSocket 시그널링 서버를 통해 드론(Python 송신자)과 웹 뷰어 간 P2P 연결을 수립합니다.

## 구성

```
webrtc/
├── drone_py/        # 드론 측 WebRTC 송신 클라이언트 (Python)
│   ├── drone_client.py
│   └── requirements.txt   # numpy, aiortc, ultralytics, opencv-python, av, websockets
├── server_js/       # WebSocket 시그널링 서버 (Node.js)
│   ├── server.js
│   └── package.json       # ws ^8.18.3
└── index.html       # 브라우저 뷰어
```

## 실행 (PoC)

```bash
# 1) 시그널링 서버 (Node.js)
cd server_js && npm install && npm start

# 2) 드론 클라이언트 (Python)
cd drone_py && pip install -r requirements.txt && python drone_client.py

# 3) index.html 을 브라우저로 열어 영상 수신
```

> 사전조사 단계의 PoC이며, 본 프로젝트의 실시간 탐지·스트리밍 구현은 [`AI/ObjectDetection/yolo_jetson`](../../../../AI/ObjectDetection/yolo_jetson)에서 발전된 형태로 사용됩니다.
