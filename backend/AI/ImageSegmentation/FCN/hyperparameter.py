HYPERPARAMETERS = {
    # 데이터셋 경로
    "train_img_dir": "dataset/augmented_combined_data/images", # dataset v1
    "train_mask_dir": "dataset/augmented_combined_data/masks", # dataset v1
    # "train_img_dir": "dataset/augmented_data_cut_swap/images", # dataset v2
    # "train_mask_dir": "dataset/augmented_data_cut_swap/masks", # dataset v2
    "valid_img_dir": "dataset/validation/images",
    "valid_mask_dir": "dataset/validation/masks",

    # 학습 설정
    "num_epochs": 50,
    "batch_size": 16,
    "learning_rate": 1e-4,
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
    "scheduler_factor": 0.3,
    "T_max": 50,
    "eta_min": 1e-6,

# OneCycle schedule
#     # 학습 설정
#     "num_epochs": 50,
#     "batch_size": 8,
#     "learning_rate": 1e-3,
#     "weight_decay": 1e-2,
#     "optimizer": "AdamW",
#     "loss_function": "BCEWithLogitsLoss",  # 또는 DiceLoss 등 확장 가능
#     "image_size": 512,
#     "num_workers": 4,
#     "num_classes": 1,

#     # 스케줄러 설정
#     "scheduler": "OneCycleLR",  # FCN에서는 OneCycleLR 사용
#     "max_lr": 1e-3,             # OneCycle의 최고 learning rate
#     "div_factor": 25.0,
#     "final_div_factor": 1e3,
#     "pct_start": 0.3,
#     "anneal_strategy": "cos",
#     "scheduler_mode": "max",
#     "scheduler_patience": 5,
#     "scheduler_factor": 0.5,
}
