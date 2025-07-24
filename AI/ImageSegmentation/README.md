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