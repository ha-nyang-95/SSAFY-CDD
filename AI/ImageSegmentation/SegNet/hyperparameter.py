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
    "optimizer": "Adam",
    "loss_function": "BCELoss", # Or "BCELoss", "DiceLoss", "DiceBCEWithLogitsLoss"
    "image_size": 512,
    "num_workers": 4,
    
    # scheduler 설정
    "scheduler": "ReduceLROnPlateau", # Or None, "CosineAnnealingLR"
    "scheduler_mode": "max",
    "scheduler_patience": 5,
    "scheduler_factor": 0.5,
}