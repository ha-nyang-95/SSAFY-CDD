import os
import pytorch_lightning as pl
import optuna
import torch
import json
from datetime import datetime
from pytorch_lightning.loggers import MLFlowLogger
from optuna.integration import MLflowCallback
# from lightning.pytorch.callbacks import OptunaPruning
from util import MODEL_NAME_MAP, load_module_from_path
from dataloader import get_dataloaders
from lightning_module.factory import get_segmentation_model


def objective(trial, model_dir_name, hp: dict, optuna_hp: dict):
    """
        Optuna trial을 위한 objective 함수
    """

    trial_hp = {
        **hp,
        "learning_rate": trial.suggest_float("learning_rate", optuna_hp["min_lr"], optuna_hp["max_lr"], log=True),
        "optimizer": trial.suggest_categorical("optimizer", optuna_hp["optimizers"]),
        "batch_size": trial.suggest_categorical("batch_size", optuna_hp["batch_sizes"]),
    }
    
    # --- MLflow 로거 설정 ---
    mlflow_logger = MLFlowLogger(
        experiment_name="Optuna_Hyperparameter_Tuning",
        run_name=f"trial_{trial.number}",
        tracking_uri=f"{model_dir_name}/mlruns",
        log_model=False # checkpoint 설정
    )
    
    # AdamW 선택 시 weight_decay 제안
    if trial_hp["optimizer"] == "AdamW":
        trial_hp["weight_decay"] = trial.suggest_float("weight_decay", 1e-5, 1e-2, log=True)
    else:
        # AdamW가 아닐 경우 기본값 설정
        trial_hp["weight_decay"] = 0.0 

    # 모델 및 데이터 로더 초기화
    model = get_segmentation_model(model_name=model_dir_name, **trial_hp)
    train_loader, val_loader = get_dataloaders(**trial_hp)

    # Pruning 콜백
    # pruning_callback = OptunaPruning(trial, monitor="val_iou")

    # 트레이너 설정
    trainer = pl.Trainer(
        max_epochs=trial_hp["num_epochs"],
        accelerator='gpu' if torch.cuda.is_available() else 'cpu',
        devices=1,
        callbacks=[], # pruning callback 사용 불가능
        logger=mlflow_logger,
        enable_checkpointing=False,
        enable_progress_bar=True,
    )

    # 학습 실행
    try:
        trainer.fit(model, train_loader, val_loader)
    except Exception as e:
        print(f"Trial failed with error: {e}")
        # 실패한 trial은 이상치 반환
        return 0.0

    # 검증 IoU 반환
    return trainer.callback_metrics.get("val_iou", 0.0).item()

def save_result(study, model_name):
    """
        Optuna로 찾은 최적의 하이퍼파라미터 json파일로 저장
    """

    best_result = {
        "best_value_val_iou": study.best_value,
        "best_params": study.best_trial.params,
        "trial_number": study.best_trial.number
    }

    final_report = {
        "optimization_summary": {
            "model_name": model_name,
            "finished_trials_count": len(study.trials),
            "best_trial_info": best_result
        }
    }

    output_dir = f"{model_name}/optuna_results"
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"{output_dir}/optuna_best_params_{model_name}_{timestamp}.json"
    
    with open(output_filename, 'w', encoding="utf-8") as f:
        json.dump(final_report, f, ensure_ascii=False, indent='\t')

def run_optuna(args):
    """
        Optuna 최적화 실행
    """
    model_dir_name = MODEL_NAME_MAP[args.model_name]

    hyperparameter_file_path = f"{model_dir_name}/hyperparameter.py"
    hp_module = load_module_from_path("hyperparameter_module", hyperparameter_file_path)
    base_hp = hp_module.HYPERPARAMETERS

    optuna_module = load_module_from_path("optuna_hyperparameter_module", "optuna_hyperparameter.py")
    optuna_hp = optuna_module.HYPERPARAMETERS

    # 기본 모델의 하이퍼파라미터 + Optuna 하이퍼파라미터 <- 언패킹할 때, 같은 key가 있으면 나중에 오는 값으로 덮어씌워짐
    hp = {
        **base_hp, **optuna_hp
    }

    mlflow_callback = MLflowCallback(
        metric_name="val_iou",
        tracking_uri=f"{model_dir_name}/mlruns",
        tag_study_user_attrs=True,
        tag_trial_user_attrs=True
    )

    # Optuna 스터디 생성
    study = optuna.create_study(
        direction="maximize",
        pruner=optuna.pruners.MedianPruner()
    )

    # 최적화 실행
    study.optimize(
        lambda trial: objective(trial, args.model_name, base_hp, optuna_hp),
        n_trials=hp["n_trials"],
        timeout=hp["timeout"],
        callbacks=[mlflow_callback]
    )

    # 결과 저장
    save_result(study, model_dir_name)