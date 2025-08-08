HYPERPARAMETERS = {
    "n_trials": 50,
    "timeout": 86400, # 하루가 지나면 종료
    "min_lr": 1e-5,
    "max_lr": 1e-2,
    "optimizers": ["Adam", "AdamW"],
    "batch_sizes": 16
    }