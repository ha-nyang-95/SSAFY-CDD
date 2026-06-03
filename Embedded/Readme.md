
# 🏗️ CDD (Crack Detect Drone)

## 📝 프로젝트 개요

본 프로젝트는 **NVIDIA Jetson Orin Nano**와 **Raspberry Pi 4**를 유기적으로 연동하여, 영상 기반의 실시간 균열 탐지와 LiDAR 센서 기반의 정밀 측정을 동시에 수행하는 고성능 임베디드 시스템입니다.

Jetson이 독립적인 \*\*Wi-Fi AP(Access Point)\*\*가 되어 자체 네트워크를 구축하면, Raspberry Pi가 해당 네트워크에 접속하여 외부 인터넷 연결 없이도 안정적인 통신 환경을 보장합니다. 사용자는 웹 UI를 통해 실시간으로 AI 분석 영상을 확인하고, 필요시 정밀 측정 명령을 내려 수집된 모든 데이터를 **AWS S3** 클라우드에 체계적으로 저장하고 관리할 수 있습니다.



## ✨ 주요 기술 및 하드웨어

| 구분              | 기술 및 사양                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| **Main AI Board** | `NVIDIA Jetson Orin Nano`                                                   |
| **Sensor Board** | `Raspberry Pi 4 Model B`                                                    |
| **Camera Sensor** | `Web Camera` (RTSP Stream)                                                  |
| **Precision Sensor**| `YDLIDAR X4 Pro`                                                               |
| **AI Model** | `YOLOv8` for Real-time Crack Detection                                      |
| **Communication** | `MQTT` Protocol, `Wi-Fi AP Mode` (Hostapd & Dnsmasq)                        |
| **Web Framework** | `Flask` for UI & Video Streaming                                            |
| **Cloud** | `AWS S3` for Data Storage                                                   |

-----

## ⚙️ 시스템 컴포넌트

### 컴포넌트 역할

  - **Jetson Orin Nano (Main Controller)**

      - **AI Vision**:  Raspberry Pi로부터 RTSP 비디오 스트림을 수신하고 `YOLOv8` 모델을 통해 실시간으로 카메라 영상을 분석하고 균열을 탐지합니다.
      - **Web Server**: `Flask` 기반의 웹 UI를 제공하여 사용자와 상호작용하고 분석 영상을 스트리밍합니다.
      - **Network Hub**: 자체적인 **Wi-Fi AP 및 DHCP 서버** 역할을 수행하여 Raspberry Pi와의 안정적인 P2P(Peer-to-Peer) 통신 환경을 구축합니다.
      - **System Brain**: 전체 시스템의 동작을 총괄하며, MQTT 브로커로서 Raspberry Pi에 명령을 전달하고 데이터를 수신하여 클라우드에 업로드합니다.

  - **Raspberry Pi 4 (Sensor Controller)**
      - **Real-time Video Streaming**: 로지텍 웹캠을 사용하여 실시간 영상을 RTSP 프로토콜로 Jetson에 스트리밍하는 비디오 서버 역할을 합니다.
      - **Precision Sensing**: Jetson의 명령을 받아 `YDLIDAR` 센서를 구동하고, 균열의 물리적 데이터(깊이, 의심 지점 수 등)를 정밀하게 측정합니다.
      - **Data Publisher**: 측정한 센서 데이터를 JSON 형식으로 가공하여 MQTT 프로토콜을 통해 Jetson에 전송합니다.

### 동작 플로우

1.  **네트워크 구축**: `Jetson`이 AP 모드로 부팅하여 자체 Wi-Fi 네트워크를 생성합니다.
2.  **연결**: `Raspberry Pi`가 Jetson의 Wi-Fi에 자동으로 접속하고, 로지텍 웹캠 영상을 RTSP 스트림으로 송출하기 시작함과 동시에 MQTT 클라이언트를 실행하여 명령을 대기합니다.
3.  **실시간 분석**: 사용자가 Jetson의 웹 UI에 접속하면, 실시간 카메라 영상과 AI 분석 결과가 스트리밍됩니다.
4.  **명령 전달**: 사용자가 '정밀 측정'을 요청하면, Jetson은 `MQTT`를 통해 Raspberry Pi에 측정 시작 명령을 보냅니다.
5.  **정밀 측정 및 결과 전송**: Raspberry Pi는 LiDAR를 구동하여 데이터를 측정한 뒤, 그 결과를 `MQTT`를 통해 Jetson으로 다시 전송합니다.
6.  **데이터 통합 및 저장**: Jetson은 수신한 LiDAR 데이터와 해당 시점의 카메라 이미지를 통합하여 `AWS S3` 버킷에 업로드합니다.

-----

## 📂 프로젝트 디렉토리 구조

```
EMBEDDED
│
├── JetsonOrinNano
│   │
│   ├─ live_detect            # Jetson 메인 애플리케이션
│   │  ├─ app.py                 # Flask 서버 실행 및 메인 로직
│   │  ├─ config.py              # 시스템 핵심 설정 파일
|   |  ├─.env.example            # 환경변수 설정용 견본 파일
│   │  ├─ video_processing.py    # YOLO 모델 추론 및 비디오 처리
│   │  ├─ mqtt_handler.py        # MQTT 브로커 및 클라이언트 로직
│   │  ├─ s3_handler.py          # AWS S3 연동 로직
│   │  ├─ requirements.txt       # 라이브러리 의존성
│   │  ├─ best_weights_v2.pt     # 학습된 YOLOv8 모델 가중치
│   │  ├─ torch-2.3.0-cp310-cp310-linux_aarch64.whl       # Jetson(aarch64)용 PyTorch wheel
│   │  ├─ torchvision-0.18.0a0+6043bc2-cp310-cp310-linux_aarch64.whl
│   │  ├─ torchaudio-2.3.0+952ea74-cp310-cp310-linux_aarch64.whl
│   │  └─ templates              # 웹 UI (HTML)
│   │
│   └─ network              # Jetson AP 모드 및 네트워크 설정
│      ├─ hostapd.conf         # AP(Access Point) 설정
│      ├─ dnsmasq.conf         # DHCP 서버 설정 (IP 자동 할당)
│      └─ wnet.nmconnection     # NetworkManager 연결 프로파일
│
└── RaspberryPi4
    │
    └─ live_and_precision_detect   # Raspberry Pi 센서 애플리케이션
       ├─ rpi_mqtt.py            # MQTT 클라이언트 실행 및 메인 로직
       └─ lidar_scanner.py       # LiDAR 센서 제어 및 데이터 처리 클래스
```

> 📦 Jetson Orin Nano(aarch64, Python 3.10)에서 GPU 가속이 동작하도록 `torch 2.3.0` / `torchvision 0.18.0` / `torchaudio 2.3.0`의 aarch64 wheel을 `live_detect/`에 동봉했습니다. 일반 PyPI 휠 대신 동봉된 `.whl` 파일로 설치하세요.