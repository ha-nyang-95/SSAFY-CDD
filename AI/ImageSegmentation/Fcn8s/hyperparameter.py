HYPERPARAMETERS = {
    # 데이터셋 경로
    "train_img_dir": "dataset/Dataset_v0/train/images",
    "train_mask_dir": "dataset/Dataset_v0/train/masks",
    "valid_img_dir": "dataset/Dataset_v0/valid/images",
    "valid_mask_dir": "dataset/Dataset_v0/valid/masks",

    # 학습 설정
    "num_epochs": 50,
    "batch_size": 8,
    "learning_rate": 1e-3,
    "weight_decay": 1e-2,
    "optimizer": "AdamW",
    "loss_function": "BCEWithLogitsLoss",  # 또는 DiceLoss 등 확장 가능
    "image_size": 512,
    "num_workers": 4,
    "num_classes": 1,

    # 스케줄러 설정
    "scheduler": "OneCycleLR",  # FCN에서는 OneCycleLR 사용
    "max_lr": 1e-3,             # OneCycle의 최고 learning rate
    "div_factor": 25.0,
    "final_div_factor": 1e3,
    "pct_start": 0.3,
    "anneal_strategy": "cos",
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.5,
}
