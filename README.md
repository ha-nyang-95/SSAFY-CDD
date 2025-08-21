# CDD (Crack Detation Drone)

드론에 부착하여 균열 탐지를 수행할 수 있도록 하는 AIoT 서비스

![포스터](./images/CDD_포스터.png)

<!-- ![Main Banner](./images/MainBanner.png) -->

</br></br>

## 개요
### 기간 : 7/14 - 8/17

### 인원 : 6명 (팀장: 문소윤, 팀원: 문빈, 유승현, 장철환, 조정래, 진효창)

</br></br>

## 기획배경
그동안의 균열 탐지 방법은 사람이 직접 눈으로 확인하는 방식이었습니다. 하지만 이러한 방식은 비용과 많은 시간이 필요하고 많은 사람이 필요했습니다. 이 때문에 자주 검사할 수 없어 위험 요소를 뒤늦게 발견하기도 합니다.

이러한 문제를 해결하기 위해 드론을 통해 균열을 탐지하고자 하였습니다. 드론에 고해상도 카메라와 AI 기반 균열 인식 시스템을 탑재하여 자동으로 균열을 감지하고, LiDAR 센서를 통해 균열의 깊이까지 정확하게 측정할 수 있도록 구현했습니다.

수집된 데이터는 웹 기반 3D 시각화 플랫폼을 통해 사용자가 직관적으로 현장 상황을 파악할 수 있도록 제공됩니다. 사용자는 브라우저에서 3D 환경을 통해 균열의 위치, 크기, 심각도를 실시간으로 확인하고 분석할 수 있습니다.

이를 통해 기존 방식 대비 검사 시간을 크게 단축하고 비용을 절감하면서도, 위험 지역에 인력을 투입하지 않고도 정확하고 객관적인 구조물 안전 점검이 가능한 통합 솔루션을 구축하였습니다.

</br></br>

</br></br>

### 기존 서비스와의 차별점

균열 탐지에서 그치지 않고, 라이다를 활용한 정밀 검사, 이미지 세그먼트, 3D 모델링 등으로 더 자세한 정보를 제공합니다.


</br></br>

### CDD 주요 기능 소개

1. Crack Detection : 실시간 영상에서 균열을 탐지하는 On-Device AI
2. Crack Segmentation : 균열을 정밀하게 탐지하는 AI
3. 3D Modeling : 촬영한 영상을 바탕으로 구조물을 3D 모델로 변환하고, 이를 활용해 균열의 위치와 크기를 알 수 있게 합니다.

</br></br>

### 🚀 프로젝트 시연 영상

아래 이미지를 클릭하면 영상이 재생됩니다.

[![프로젝트 시연 영상](https://img.youtube.com/vi/M6N3P6Uup3A/0.jpg)](https://youtu.be/M6N3P6Uup3A)

</br></br>

## 아키텍처 소개
![Architecture](./images/CDD_Architecture.png)


</br></br></br>

## 유저 플로우차트
![User FlowChart](./images/공통%20프로젝트%20유저%20플로우차트.png)


</br></br></br>

## 팀 구성 및 역할

### 👨‍💼 문소윤 (팀장)
[![GitHub](https://img.shields.io/badge/GitHub-msy-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/msy)

**역할:** ![TeamLead](https://img.shields.io/badge/TeamLead-FF6B6B?style=flat-square) ![Embedded](https://img.shields.io/badge/Embedded-FF8C42?style=flat-square)

**기술 스택:**
![RaspberryPi](https://img.shields.io/badge/Raspberry_Pi-A22846?style=flat-square&logo=raspberry-pi&logoColor=white)
![JetsonNano](https://img.shields.io/badge/Jetson_Nano-76B900?style=flat-square&logo=nvidia&logoColor=white)
![YOLO](https://img.shields.io/badge/YOLOv8n-00FFFF?style=flat-square)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)
![RTSP](https://img.shields.io/badge/RTSP-4285F4?style=flat-square)
![MQTT](https://img.shields.io/badge/MQTT-660066?style=flat-square&logo=eclipsemosquitto&logoColor=white)
![LiDAR](https://img.shields.io/badge/LiDAR-FF6B35?style=flat-square)

---

### 👨‍🔬 문빈
[![GitHub](https://img.shields.io/badge/GitHub-moonbin-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/moonbin)

**역할:** ![AI](https://img.shields.io/badge/AI_Developer-4ECDC4?style=flat-square)

**기술 스택:**
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![FCN](https://img.shields.io/badge/FCN-FF6B6B?style=flat-square)
![SegNet](https://img.shields.io/badge/SegNet-FF8C42?style=flat-square)
![NeRF](https://img.shields.io/badge/NeRF-FFD93D?style=flat-square)
![3DGaussianSplatting](https://img.shields.io/badge/3D_Gaussian_Splatting-6BCF7F?style=flat-square)
![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=flat-square&logo=serverless&logoColor=white)

---

### 👨‍💻 유승현
[![GitHub](https://img.shields.io/badge/GitHub-yoo--seunghyeon-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yoo-seunghyeon)

**역할:** ![AI](https://img.shields.io/badge/AI_Developer-4ECDC4?style=flat-square) ![Embedded](https://img.shields.io/badge/Embedded-FF8C42?style=flat-square) ![CloudEngineer](https://img.shields.io/badge/Cloud_Engineer-FF9500?style=flat-square)

**기술 스택:**
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![YOLO](https://img.shields.io/badge/YOLOv8n-00FFFF?style=flat-square)
![Neuralangelo](https://img.shields.io/badge/Neuralangelo-FF6B6B?style=flat-square)
![TripoSR](https://img.shields.io/badge/TripoSR-4ECDC4?style=flat-square)
![LiDAR](https://img.shields.io/badge/LiDAR-FF6B35?style=flat-square)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![S3](https://img.shields.io/badge/S3-569A31?style=flat-square&logo=amazon-s3&logoColor=white)
![Lambda](https://img.shields.io/badge/Lambda-FF9900?style=flat-square&logo=aws-lambda&logoColor=white)

---

### 👨‍💼 장철환
[![GitHub](https://img.shields.io/badge/GitHub-jch-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jch)

**역할:** ![PM](https://img.shields.io/badge/Project_Manager-45B7D1?style=flat-square) ![DataEngineer](https://img.shields.io/badge/Data_Engineer-2E8B57?style=flat-square) ![Frontend](https://img.shields.io/badge/Frontend-61DAFB?style=flat-square)

**기술 스택:**
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![ThreeJS](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![LCD](https://img.shields.io/badge/LCD_Display-FF6B35?style=flat-square)
![DataPreprocessing](https://img.shields.io/badge/Data_Preprocessing-4ECDC4?style=flat-square)

---

### 👨‍🔬 조정래
[![GitHub](https://img.shields.io/badge/GitHub-jjr-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jjr)

**역할:** ![AI](https://img.shields.io/badge/AI_Developer-4ECDC4?style=flat-square) ![CloudEngineer](https://img.shields.io/badge/Cloud_Engineer-FF9500?style=flat-square)

**기술 스택:**
![DeepLab](https://img.shields.io/badge/DeepLab-FF6B6B?style=flat-square)
![UNet](https://img.shields.io/badge/U--Net-4ECDC4?style=flat-square)
![YOLO](https://img.shields.io/badge/YOLOv8n-00FFFF?style=flat-square)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=flat-square&logo=serverless&logoColor=white)

---

### 👨‍💻 진효창
[![GitHub](https://img.shields.io/badge/GitHub-jhc-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/jhc)

**역할:** ![Backend](https://img.shields.io/badge/Backend-96CEB4?style=flat-square) ![Frontend](https://img.shields.io/badge/Frontend-61DAFB?style=flat-square)

**기술 스택:**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Authentication](https://img.shields.io/badge/Authentication-FF6B6B?style=flat-square)
![S3](https://img.shields.io/badge/S3-569A31?style=flat-square&logo=amazon-s3&logoColor=white)
![Database](https://img.shields.io/badge/Database-336791?style=flat-square&logo=postgresql&logoColor=white)
![API](https://img.shields.io/badge/API_Design-FF9500?style=flat-square)
