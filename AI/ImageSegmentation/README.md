## Image Segmentation

구조물 이미지에서 **균열(Crack)** 영역을 픽셀 단위로 분할(Segmentation)하는 모듈입니다. SegNet / UNet / FCN / DeepLab 등 여러 모델을 동일한 학습 파이프라인으로 학습·비교할 수 있도록 **PyTorch Lightning** 기반으로 구성했으며, **MLflow**로 실험을 추적하고 **Optuna**로 하이퍼파라미터를 탐색합니다.

- **학습 진입점** : `python train.py <model_name>` (예: `segnet`, `unet`, `fcn`, `deeplab`)
- **하이퍼파라미터 탐색 진입점** : `python run_optuna.py` (또는 `train.py`를 통한 Optuna 모드)
- **추론/테스트 진입점** : `python test.py <model_name>` — 학습된 체크포인트로 타일 단위 추론 후 균열 영역을 붉은색 마스크로 오버레이해 저장

### 디렉토리 / 파일 구성

- `train.py`
    학습 실행 진입점. PyTorch Lightning Trainer로 일반 fine-tuning, k-fold, Optuna 모드를 분기. MLflow 로깅 및 `ModelCheckpoint` 저장
- `test.py`
    학습된 체크포인트(`<Model>/checkpoint/*.ckpt`)를 로드해 `dataset/test`의 이미지에 대해 `tiler` 기반 타일 추론을 수행하고 결과를 `<Model>/result`에 저장
- `run_optuna.py`
    Optuna `objective` 정의 및 스터디 실행. 학습률/옵티마이저/배치 크기를 탐색하며 MLflow로 trial 로깅
- `optuna_hyperparameter.py`
    Optuna 탐색 범위(`n_trials`, `timeout`, `min_lr`, `max_lr`, `optimizers`, `batch_sizes`) 정의
- `dataloader.py`
    데이터셋(이미지/마스크) 로딩 및 DataLoader 구성
- `util.py`
    `MODEL_NAME_MAP`(segnet/unet/fcn/deeplab → 디렉토리) 및 `load_module_from_path`(모델/하이퍼파라미터 동적 로드)
- `lightning_module/`
    Lightning 기반 공통 모듈 — `factory.py`(모델 팩토리), `model.py`(LightningModule), `kfold_trainer.py`(k-fold 학습)
- `deploy/`
    추론 API 서버 배포 코드 (Flask 서버, GCP Cloud Run 배포용 Dockerfile / cloudbuild.yaml). 자세한 내용은 `deploy/README.md` 참고
- `SegNet/`, `UNet/`, `FCN/`, `DeepLab/`
    각 모델 디렉토리. 모델별 `model.py`, `hyperparameter.py`, mlflow 로그, checkpoint를 둠

> 의존성(`requirements.txt`): `torch`, `torchvision`, `pytorch_lightning`, `mlflow`, `optuna`, `optuna-integration`, `pandas`, `matplotlib`, `Pillow`, `numpy`, `tqdm` (추론 타일링에는 `tiler` 패키지 필요)

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
