HYPERPARAMETERS = {
    # dataset 경로
    "train_img_dir": "dataset/augmented_combined_data/images", # dataset v1
    "train_mask_dir": "dataset/augmented_combined_data/masks", # dataset v1
    # "train_img_dir": "dataset/augmented_data_cut_swap/images", # dataset v2
    # "train_mask_dir": "dataset/augmented_data_cut_swap/masks", # dataset v2
    "valid_img_dir": "dataset/validation/images",
    "valid_mask_dir": "dataset/validation/masks",

    # 학습 설정
    "num_epochs": 50,
    "batch_size": 16,
    "learning_rate": 1e-3,
    "optimizer": "AdamW", # AdamW 사용할 때 무조건 wegiht_decay 설정
    "weight_decay": 1e-2,
    "loss_function": "BCEWithLogitsLoss", # Or "BCELoss", "DiceLoss", "DiceBCEWithLogitsLoss"
    "image_size": 512,
    "num_workers": 4,
    "num_classes": 1,
    "lr_factor": 1e-2, # encoder의 학습률을 decoder와 다르게 하기 위함
    
    # scheduler 설정
    "scheduler": "ReduceLROnPlateau", # Or None, "CosineAnnealingLR"
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.5,
    "T_max": 50,
    "eta_min": 1e-6,
}