import sys
from pathlib import Path
import torch
import mlflow
from util import *
from dataloader import get_dataloaders


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

    model_file_path = f"{model_dir_name}/model.py"
    hyperparameter_file_path = f"{model_dir_name}/hyperparameter.py"

    # 모델 디렉토리에서 모델, 하이퍼파라미터 불러옴
    model_module = load_module_from_path("model_module", model_file_path)
    hp_module = load_module_from_path("hyperparameter_module", hyperparameter_file_path)

    HP = hp_module.HYPERPARAMETERS
    get_segmentation_model = model_module.get_segmentation_model # Get the model function
    
    set_seed(SEED)
    device = setup_device()

    # MLflow Setup
    mlflow_run_dir = Path(model_dir_name) / "mlruns"
    mlflow_run_dir.mkdir(exist_ok=True) # Ensure mlruns directory exists
    mlflow.set_experiment(f"{model_dir_name}_Training")

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

    model = get_segmentation_model(model_name=model_arg_name.capitalize(), num_classes=1).to(device)
    print(f"Model {model_arg_name.capitalize()}'s num of parameters: {count_parameters(model)}")

    criterion = get_loss_function(HP["loss_function"])  # Loss function 불러오기
    optimizer = get_optimizer(model=model, optimizer_name=HP["optimizer"], learning_rate=learning_rate) # Optimizer 불러오기
    scheduler = get_scheduler( # Scheduler 불러오기
        scheduler_param={
            "scheduler_name": HP["scheduler"],
            "scheduler_mode": HP["scheduler_mode"],
            "scheduler_patience": HP["scheduler_patience"],
            "scheduler_factor": HP["scheduler_factor"],
        },
        optimizer=optimizer,
        num_epochs=num_epochs
    )

    # MLflow Tracking for this run
    with mlflow.start_run():
        mlflow.log_params(HP)
        mlflow.log_param("model_name", model_arg_name.capitalize())
        mlflow.log_param("total_trainable_parameters", count_parameters(model))

        best_val_iou = -1.0
        best_epoch = -1

        for epoch in range(num_epochs):
            print(f"\nEpoch {epoch+1}/{num_epochs}")

            # Training phase
            train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
            print(f"Train Loss: {train_loss:.4f}")
            mlflow.log_metric("train_loss", train_loss, step=epoch)

            # Validation phase
            val_loss, val_iou, val_f1 = validate_one_epoch(model, val_loader, criterion, device)
            print(f"Val Loss: {val_loss:.4f}, Val IoU: {val_iou:.4f}, Val F1: {val_f1:.4f}")
            mlflow.log_metric("val_loss", val_loss, step=epoch)
            mlflow.log_metric("val_iou", val_iou, step=epoch)
            mlflow.log_metric("val_f1_score", val_f1, step=epoch)

            if scheduler:
                if isinstance(scheduler, ReduceLROnPlateau):
                    scheduler.step(val_iou if scheduler_mode == 'max' else val_loss)
                else:
                    scheduler.step()

            current_lr = optimizer.param_groups[0]['lr']
            mlflow.log_metric("learning_rate", current_lr, step=epoch)

            # validation 데이터셋에 대해 IoU 가장 높은 모델 저장
            if val_iou > best_val_iou:
                best_val_iou = val_iou
                best_epoch = epoch
                # Save model state dict
                model_save_path = f"{model_dir_name}/weights.pt"
                torch.save(model.state_dict(), model_save_path)
                print(f"Saved best model with Val IoU: {best_val_iou:.4f} at epoch {best_epoch+1}")

        print(f"\n{model_arg_name.capitalize()} 모델 학습 완료.")
        print(f"Best Validation IoU: {best_val_iou:.4f} at Epoch {best_epoch+1}")

        mlflow.log_metric("best_val_iou", best_val_iou)
        mlflow.log_metric("best_epoch", best_epoch)

        mlflow.log_artifact(model_save_path)

if __name__ == "__main__":
    main()