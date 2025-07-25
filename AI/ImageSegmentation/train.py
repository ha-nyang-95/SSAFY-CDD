import sys
import os
import torch
from pathlib import Path
from util import MODEL_NAME_MAP, load_module_from_path
from dataloader import get_dataloaders
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, LearningRateMonitor
from pytorch_lightning.loggers import MLFlowLogger
from lightning_module.factory import get_segmentation_model


SEED = 102

def main():
    if len(sys.argv) < 2:
        print("Usage: python train.py <model_name>")
        sys.exit(1)

    model_arg_name = sys.argv[1].lower()

    if model_arg_name not in MODEL_NAME_MAP:
        print(f"Error: Model '{model_arg_name}' not found in mapping.\n Available: \n{list(MODEL_NAME_MAP.keys())}")
        sys.exit(1)

    model_dir_name = MODEL_NAME_MAP[model_arg_name]
    hyperparameter_file_path = f"{model_dir_name}/hyperparameter.py"

    hp_module = load_module_from_path("hyperparameter_module", hyperparameter_file_path)

    HP = hp_module.HYPERPARAMETERS

    HP['model_name'] = model_arg_name

    # 모델 불러오기
    try:
        print(f"Loading {model_arg_name} model...")
        model = get_segmentation_model(
            **HP
        )
        print(f"{model_dir_name} model loaded successfully.\n")
    except KeyError as e:
        print(f"{e}가 {model_dir_name}/hyperparameter.py에 정의되어 있지 않음.")
        sys.exit(1)


    num_epochs = HP["num_epochs"]
    batch_size = HP["batch_size"]
    learning_rate = HP["learning_rate"]
    image_size = HP["image_size"]
    num_workers = HP["num_workers"]
    scheduler_mode = HP["scheduler_mode"]

    train_loader, val_loader = get_dataloaders(
        train_img_dir=HP["train_img_dir"],
        train_mask_dir=HP["train_mask_dir"],
        val_img_dir=HP["valid_img_dir"],
        val_mask_dir=HP["valid_mask_dir"],
        img_size=image_size,
        batch_size=batch_size,
        num_workers=num_workers
    )
    
    # checkpoint 설정
    checkpoint_dir = f"{model_dir_name}/checkpoint/"
    os.makedirs(checkpoint_dir, exist_ok=True)

    checkpoint_callback = ModelCheckpoint(
        dirpath=checkpoint_dir,
        filename=f"{model_dir_name}_best_model",
        monitor="val_iou",
        mode="max",        # IoU가 높은 가중치만 저장
        save_top_k=1,      # 가장 좋은 모델 1개만 저장
        save_last=True,    # 마지막 에포크의 모델도 저장 <- 학습 중단됐을 때, 다시 이어서 실행할 수 있게 하도록
        verbose=True
    )

    # MLflow Setup
    mlflow_run_dir = Path(model_dir_name) / "mlruns"
    mlflow_run_dir.mkdir(exist_ok=True) # Ensure mlruns directory exists
    experiment_name = f"{model_dir_name}_Training"

    lr_monitor = LearningRateMonitor(logging_interval='epoch')

    # MLflow 로거 초기화
    mlflow_logger = MLFlowLogger(
        experiment_name=experiment_name,
        tracking_uri=f"{model_dir_name}/mlruns",
        log_model=True # 모델 체크포인트 자동 로깅
    )
    
    # MLflow에 하이퍼파라미터 로깅 (Lightning의 save_hyperparameters와 연동)
    # model.hparams는 BaseSegmentationModule에서 save_hyperparameters()에 의해 저장됨
    mlflow_logger.log_hyperparams(model.hparams)

    trainer = pl.Trainer(
        max_epochs=num_epochs,
        accelerator='gpu' if torch.cuda.is_available() else 'cpu',
        devices=1 if torch.cuda.is_available() else None,
        logger=mlflow_logger,
        callbacks=[checkpoint_callback, lr_monitor],
        deterministic=True if SEED is not None else False, # 재현성
        enable_progress_bar=True,
        # 기타 트레이너 설정 (예: gradient_clip_val, precision 등)
    )

    print("Starting model training...")
    trainer.fit(model, train_loader, val_loader)
    print("Model training finished.")

    print(f"Best model saved at: {checkpoint_callback.best_model_path}")
    print(f"MLflow logs saved at: {mlflow_run_dir}")


if __name__ == '__main__':
    # 시드 고정 (재현성)
    pl.seed_everything(SEED, workers=True)

    main()