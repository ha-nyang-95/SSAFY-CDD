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
    "optimizer": "AdamW", # AdamW 사용할 때 무조건 wegiht_decay 설정
    "weight_decay": 1e-2,
    "loss_function": "BCEWithLogitsLoss", # Or "BCELoss", "DiceLoss", "DiceBCEWithLogitsLoss"
    "image_size": 512,
    "num_workers": 4,
    "num_classes": 1,
    
    # scheduler 설정
    "scheduler": "ReduceLROnPlateau", # Or None, "CosineAnnealingLR"
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.5,
    "T_max": 50,
    "eta_min": 1e-6,
}