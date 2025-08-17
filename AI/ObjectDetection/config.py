HYPERPARAMETERS = {
    "model": "yolov8n.pt",
    "project": "runs/train",
    "name": "exp",              # 실험(experiment) 이름
    "exist_ok": True,           # 기존 실험 디렉토리가 있을 경우 덮어쓰기 허용

    # 학습 파라미터
    "epochs": 480,
    "batch": 16,
    "imgsz": 640,
    "device": 0,
    "patience": 10,             # Early stopping을 위한 patience (성능 개선이 없을 때 몇 에포크를 더 기다릴지)
    "seed": 102,
    "optimizer": "Adam",
    "lr0": 0.001,               # 초기 학습률 (Initial learning rate)
    "lrf": 0.01,                # 최종 학습률 (Final learning rate = lr0 * lrf)
    "momentum": 0.937,          # SGD 모멘텀 / Adam 베타1
    "weight_decay": 0.0005,     # 옵티마이저 가중치 감소 (Weight decay)

    # 데이터 증강 파라미터
    "mosaic": 1.0,              # Mosaic 증강 사용 확률 (0.0 ~ 1.0)
    "mixup": 0.1,               # MixUp 증강 사용 확률 (0.0 ~ 1.0)
    "degrees": 10.0,            # 이미지 회전 각도 범위 (+/-)
    "translate": 0.1,           # 이미지 이동 비율
    "scale": 0.5,               # 이미지 스케일(확대/축소) 범위
    "shear": 5.0,               # 이미지 전단(shear) 변형 각도
    "perspective": 0.0005,      # 원근 변환 계수
    "flipud": 0.5,              # 상하 반전 확률
    "fliplr": 0.5,              # 좌우 반전 확률
    "hsv_h": 0.015,             # 색상(Hue) 증강 강도
    "hsv_s": 0.7,               # 채도(Saturation) 증강 강도
    "hsv_v": 0.4                # 명도(Value) 증강 강도
}
