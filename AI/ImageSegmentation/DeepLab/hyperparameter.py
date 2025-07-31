HYPERPARAMETERS = {
    # dataset 경로
    "train_img_dir": "dataset/Dataset_v0/train/images",
    "train_mask_dir": "dataset/Dataset_v0/train/masks",
    "valid_img_dir": "dataset/Dataset_v0/valid/images",
    "valid_mask_dir": "dataset/Dataset_v0/valid/masks",

    # 학습 설정
    "num_epochs": 50,
    "batch_size": 32,
    "learning_rate": 1e-4,
    "optimizer": "AdamW", # AdamW 사용할 때 무조건 wegiht_decay 설정
    "weight_decay": 1e-2,
    "loss_function": "BCEWithLogitsLoss", # Or "BCELoss", "DiceLoss", "DiceBCEWithLogitsLoss"
    "image_size": 512,
    "num_workers": 6,
    "num_classes": 1,
    
    # scheduler 설정
    "scheduler": "ReduceLROnPlateau", # Or None, "CosineAnnealingLR"
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.3,
    "T_max": 50,
    "eta_min": 1e-6,
}