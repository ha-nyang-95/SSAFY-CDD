import sys
import os
import torch
import argparse
from util import MODEL_NAME_MAP, load_module_from_path
from dataloader import get_dataloaders
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, LearningRateMonitor
from pytorch_lightning.loggers import MLFlowLogger
from lightning_module.factory import get_segmentation_model
from lightning_module.kfold_trainer import run_k_fold_training
from run_optuna import run_optuna
from pathlib import Path


SEED = 102

def training(args):
    """
        일반 fine-tuning
    """
    model_arg_name = args.model_name
    model_dir_name = MODEL_NAME_MAP[model_arg_name]
    hyperparameter_file_path = f"{model_dir_name}/hyperparameter.py"

    hp_module = load_module_from_path("hyperparameter_module", hyperparameter_file_path)
    hp = hp_module.HYPERPARAMETERS
    hp['model_name'] = model_dir_name

    print(f"Loading {model_dir_name} model...")
    model = get_segmentation_model(**hp)
    print(f"{model_dir_name} model loaded successfully.\n")

    train_loader, val_loader = get_dataloaders(**hp)
    
    # checkpoint 설정
    checkpoint_dir = f"{model_dir_name}/checkpoint/"
    os.makedirs(checkpoint_dir, exist_ok=True)

    checkpoint_callback = ModelCheckpoint(
        dirpath=checkpoint_dir,
        filename=f"{model_dir_name}_1_best_model",
        monitor="val_iou",
        mode="max",        # IoU가 높은 가중치만 저장
        save_top_k=1,      # 가장 좋은 모델 1개만 저장
        save_last=True,    # 마지막 에포크의 모델도 저장 <- 학습 중단됐을 때, 다시 이어서 실행할 수 있게 하도록
        verbose=True
    )

    # MLflow Setup
    mlflow_run_dir = Path(model_dir_name) / "mlruns"
    mlflow_run_dir.mkdir(parents=True, exist_ok=True)
    experiment_name = f"{model_dir_name}_Training_1"
    lr_monitor = LearningRateMonitor(logging_interval='epoch')

    # MLflow 로거 초기화
    mlflow_logger = MLFlowLogger(
        experiment_name=experiment_name,
        tracking_uri=f"{model_dir_name}/mlruns",
        log_model=True # 모델 체크포인트 자동 로깅
    )
    
    mlflow_logger.log_hyperparams(model.hparams)

    # 이어서 학습하는 코드 추가
    # 가중치만 로드
    ckpt_path = os.path.join(checkpoint_dir, f"{model_dir_name}_best_model.ckpt")
    if os.path.exists(ckpt_path):
        print(f"[🔁] Fine-tuning from weights only: {ckpt_path}")
        state_dict = torch.load(ckpt_path)["state_dict"]
        model.load_state_dict(state_dict)
    else:
        print("[🆕] No checkpoint found. Starting from scratch.")
    
    trainer = pl.Trainer(
        max_epochs=hp["num_epochs"],
        accelerator='gpu' if torch.cuda.is_available() else 'cpu',
        devices=1,
        logger=mlflow_logger,
        callbacks=[checkpoint_callback, lr_monitor],
        precision='16-mixed', # AMP
        # deterministic=True if SEED is not None else False, # 재현성
        deterministic=False, # MaxPooling 레이어가 비결정적이라 False로 설정.
        enable_progress_bar=True,
    )
    
    trainer.fit(model, train_loader, val_loader)

    print(f"Best model saved at: {checkpoint_callback.best_model_path}")
    print(f"MLflow logs saved at: {mlflow_run_dir}")

def lower_name(model_name: str):
    return model_name.lower()

def main():
    parser = argparse.ArgumentParser(description="Image Segmentation Model Training")
    parser.add_argument("model_name", type=lower_name, choices=list(MODEL_NAME_MAP.keys()),
                        help=f"Name of the model to train. Available: {list(MODEL_NAME_MAP.values())}")
    parser.add_argument("-o", "--optuna", action="store_true",
                        help="Run hyperparameter optimization using Optuna.")
    parser.add_argument("-k", "--kfold", action="store_true", help="Use K-Fold Cross Validation")


    args = parser.parse_args()
    try:
        if args.optuna:
            print(f"--- Model: {args.model_name}, Optuna 하이퍼파라미터 최적화 시작 ---")
            run_optuna(args)
        elif args.kfold:
            print(f"--- Model: {MODEL_NAME_MAP[args.model_name]}, K-Fold 학습 시작 ---")
            run_k_fold_training(model_name=args.model_name, num_folds=10)
        else:
            print(f"--- Model: {MODEL_NAME_MAP[args.model_name]}, 학습 시작 ---")
            training(args)
    except KeyError as e:
        print(f"{e}가 {MODEL_NAME_MAP[args.model_name]}/hyperparameter.py에 정의되어 있지 않음.")
        sys.exit(1)    



if __name__ == '__main__':
    torch.use_deterministic_algorithms(True, warn_only=True)
    pl.seed_everything(SEED, workers=True)
    
    main()