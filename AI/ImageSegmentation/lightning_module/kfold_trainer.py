import os
import torch
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint, LearningRateMonitor
from pytorch_lightning.loggers import MLFlowLogger
from util import load_module_from_path, MODEL_NAME_MAP
from lightning_module.factory import get_segmentation_model
from torchvision import transforms
from PIL import Image
from torch.utils.data import Dataset, DataLoader


class SegmentationDataset(Dataset):
    def __init__(self, image_dir, mask_dir, transform=None):
        self.image_dir = image_dir
        self.mask_dir = mask_dir
        self.image_paths = sorted([os.path.join(image_dir, fname) for fname in os.listdir(image_dir)])
        self.mask_paths = sorted([os.path.join(mask_dir, fname) for fname in os.listdir(mask_dir)])
        self.transform = transform or transforms.Compose([
            transforms.ToTensor()
        ])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert("RGB")
        mask = Image.open(self.mask_paths[idx]).convert("L")
        image = self.transform(image)
        mask = self.transform(mask)
        return image, mask


def run_k_fold_training(model_name: str, num_folds: int = 10, seed: int = 102):
    torch.manual_seed(seed)

    model_dir_name = MODEL_NAME_MAP[model_name]
    hyperparameter_file_path = f"{model_dir_name}/hyperparameter.py"
    hp_module = load_module_from_path("hyperparameter_module", hyperparameter_file_path)
    hp = hp_module.HYPERPARAMETERS
    hp['model_name'] = model_dir_name

    print(f"[🔁] {num_folds}-Fold Cross Validation 시작")

    for fold in range(1, num_folds + 1):
        print(f"\n[📂 Fold {fold}/{num_folds}]")

        train_img_dir = f"dataset/Dataset_v0/train/images/{fold}"
        train_mask_dir = f"dataset/Dataset_v0/train/masks/{fold}"
        val_img_dir = f"dataset/Dataset_v0/valid/images/{fold}"
        val_mask_dir = f"dataset/Dataset_v0/valid/masks/{fold}"

        train_dataset = SegmentationDataset(train_img_dir, train_mask_dir)
        val_dataset = SegmentationDataset(val_img_dir, val_mask_dir)

        train_loader = DataLoader(train_dataset, batch_size=hp["batch_size"], shuffle=True, num_workers=4)
        val_loader = DataLoader(val_dataset, batch_size=hp["batch_size"], shuffle=False, num_workers=4)

        model = get_segmentation_model(**hp)

        checkpoint_dir = f"{model_dir_name}/fold{fold + 1}/checkpoint"
        os.makedirs(checkpoint_dir, exist_ok=True)

        checkpoint_callback = ModelCheckpoint(
            dirpath=checkpoint_dir,
            filename=f"{model_dir_name}_fold{fold + 1}_best_model",
            monitor="val_iou",
            mode="max",
            save_top_k=1,
            save_last=True,
            verbose=True
        )

        mlflow_logger = MLFlowLogger(
            experiment_name=f"{model_dir_name}_Fold{fold + 1}_Training",
            tracking_uri=f"{model_dir_name}/fold{fold + 1}/mlruns",
            log_model=True
        )
        mlflow_logger.log_hyperparams(model.hparams)
        lr_monitor = LearningRateMonitor(logging_interval='epoch')

        trainer = pl.Trainer(
            max_epochs=hp["num_epochs"],
            accelerator='gpu' if torch.cuda.is_available() else 'cpu',
            devices=1,
            logger=mlflow_logger,
            callbacks=[checkpoint_callback, lr_monitor],
            deterministic=False,
            enable_progress_bar=True,
        )

        trainer.fit(model, train_loader, val_loader)

        print(f"[✅ Fold {fold + 1}] Best model path: {checkpoint_callback.best_model_path}")
