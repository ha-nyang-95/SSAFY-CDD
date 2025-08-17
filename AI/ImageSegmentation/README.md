### Image Segmentation Directory

- dataloader.py
    dataset 불러오는 코드   

- util.py
    학습에 필요한 메서드들 모음
    optimzer, scheduler, loss 함수 불러오는 로직
    train, backpropagation 로직
    validation 평가 로직   

- evaluation.py
    mIoU, F1 Score 평가 로직

- train.py
    학습 실행 코드
    mlflow로 저장

각 모델 디렉토리에 mlflow 로그, 모델 정의, 모델 하이퍼 파라미터 정의하면 됩니다.
- model.py
```python
class SegNet(nn.Module):
    ...

"""
 get_segmentation_model 아래 형식처럼 정의해주어야 함
 factory 메서드 방식으로, 특정 클래스에 강하게 결합되지 않도록 구현
"""
def get_segmentation_model(model_name, num_classes):
    if model_name.lower() == 'segnet':
        return SegNet(num_classes=num_classes)
    else:
        raise ValueError(f"Model {model_name} not supported in this file.")
```

- hyperparameter.py
```python
HYPERPARAMETERS = {
    # dataset 경로
    "train_img_dir": "dataset/Dataset_v0/train/images",
    "train_mask_dir": "dataset/Dataset_v0/train/masks",
    "valid_img_dir": "dataset/Dataset_v0/valid/images",
    "valid_mask_dir": "dataset/Dataset_v0/valid/masks",

    # 학습 설정
    "num_epochs": 1,
    "batch_size": 16,
    "learning_rate": 0.0001,
    "optimizer": "Adam",
    "loss_function": "BCELoss", # Or "BCELoss", "DiceLoss", "DiceBCEWithLogitsLoss"
    "image_size": 512,
    "num_workers": 4,
    
    # scheduler 설정
    "scheduler": "ReduceLROnPlateau", # Or None, "CosineAnnealingLR"
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.5,
}
```

## Hyperparameter Configuration (`hyperparameter.py`)

각 모델의 디렉토리 (e.g., `SegNet`, `UNet`)에 `hyperparameter.py` 파일을 생성하여 아래와 같이 하이퍼파라미터를 설정할 수 있습니다.

### 학습 설정

- `num_epochs`: 총 학습 에포크 수
- `batch_size`: 배치 크기
- `learning_rate`: 초기 학습률
- `optimizer`: 사용할 옵티마이저 ("Adam", "SGD", "AdamW")
- `weight_decay`: AdamW 옵티마이저 사용 시 적용할 가중치 감쇠 값
- `image_size`: 모델에 입력할 이미지 크기
- `num_workers`: 데이터 로딩에 사용할 워커 수
- `num_classes`: 클래스 수 (균열/배경 이진 분류의 경우 1로 설정)

### 데이터셋 경로

- `train_img_dir`: 학습용 이미지 디렉토리 경로
- `train_mask_dir`: 학습용 마스크 디렉토리 경로
- `valid_img_dir`: 검증용 이미지 디렉토리 경로
- `valid_mask_dir`: 검증용 마스크 디렉토리 경로

### 스케줄러 설정

- `scheduler`: 사용할 학습률 스케줄러 ("ReduceLROnPlateau", "CosineAnnealingLR", `None`)

#### `ReduceLROnPlateau` 스케줄러 설정

- `scheduler_mode`: 모니터링할 지표의 모드 ("min" 또는 "max")
- `scheduler_patience`: 성능이 개선되지 않을 때까지 기다릴 에포크 수
- `scheduler_factor`: 학습률을 감소시킬 비율 (new_lr = lr * factor)

#### `CosineAnnealingLR` 스케줄러 설정

- `T_max`: 학습률이 최소값에 도달하기까지의 에포크 수
- `eta_min`: 최소 학습률
