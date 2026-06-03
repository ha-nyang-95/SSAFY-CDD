# Object Detection (YOLOv8 균열 탐지)

드론 영상에서 **균열(Crack)** 을 탐지하기 위한 **YOLOv8n** 기반 객체 탐지 모듈입니다. 학습 / 평가 코드와 Jetson 보드용 실시간 추론·스트리밍 코드(`yolo_jetson/`)로 구성됩니다. 학습 과정은 **MLflow** 로 실험 추적합니다.

</br>

## 🗂️ 디렉토리 구조

```
ObjectDetection/
├── config.py          # 학습 하이퍼파라미터(HYPERPARAMETERS) 정의
├── dataloader.py      # dataset/data.yaml 경로 반환
├── model.py           # YOLOv8 모델 로더(load_model)
├── train.py           # 학습 진입점 (MLflow 로깅 포함)
├── inference.py       # 테스트셋 배치 추론 + mAP/FPS 평가
├── requirements.txt
└── yolo_jetson/       # Jetson Orin Nano 실시간 탐지 + WebRTC 스트리밍 (별도 README 참고)
```

> 데이터셋은 `dataset/data.yaml`, `dataset/test/images` 등 YOLO 표준 포맷을 가정합니다(저장소에 미포함).

</br>

## 🔧 의존성

`requirements.txt` : `ultralytics`, `opencv-python`, `mlflow`, `torch`, `torchvision`, `PyYAML`

```bash
pip install -r requirements.txt
```

</br>

## ⚙️ 학습 설정

`config.py`의 `HYPERPARAMETERS`에서 학습 설정을 관리합니다. 주요 값:

- 모델: `yolov8n.pt`
- `epochs=480`, `batch=16`, `imgsz=640`, `optimizer="Adam"`, `lr0=0.001`
- Early stopping `patience=10`, `seed=102`
- Mosaic / MixUp / 회전·이동·스케일·HSV 등 데이터 증강 파라미터 포함

</br>

## ▶️ 실행 방법

### 학습

```bash
python train.py
```

- `HYPERPARAMETERS`로 YOLOv8n을 학습하고, Ultralytics가 자동으로 MLflow(`YOLOv8 Crack Detection` 실험)에 로깅합니다.
- 학습 완료 후 `best.pt`를 `best_weights.pt`로 복사하고 MLflow 아티팩트로 등록합니다.

### 평가 / 추론

```bash
python inference.py
```

- `best_weights.pt`를 로드해 테스트셋에 대해 `model.val()`로 **mAP50 / mAP50-95**를 측정합니다.
- 이어서 각 이미지의 평균 추론 시간과 **FPS**를 측정하고, 결과 이미지를 `runs/detect/`에 저장합니다.

### Jetson 실시간 추론

드론 탑재 Jetson Orin Nano에서의 실시간 탐지 및 WebRTC 스트리밍은 [`yolo_jetson/README.md`](./yolo_jetson/README.md)를 참고하세요.
