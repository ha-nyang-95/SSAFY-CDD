import torch
import torch.nn as nn
from torch.optim import Adam, SGD
from torch.optim.lr_scheduler import ReduceLROnPlateau, CosineAnnealingLR
import numpy as np
import random
import importlib.util
from evaluation import calculate_metrics
from tqdm import tqdm


MODEL_NAME_MAP = {
    "segnet": "SegNet",
    "unet": "UNet",
    "fcn": "FCN",
    "imagesegmentation": "ImageSegmentation"
}

def set_seed(seed):
    """
        실험 재현성을 위한 시드 설정
    """
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed) # if you are using multi-GPU.
    np.random.seed(seed)
    random.seed(seed)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True

def setup_device():
    """
        학습 Device 설정
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    return device

def count_parameters(model):
    """
        PyTorch 모델의 파라미터 수 계산
    """
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def load_module_from_path(module_name, file_path):
    """
        model, hyperparameter 불러올 때 사용
    """

    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def get_loss_function(loss_name):
    """
        loss 함수 불러오기
    """

    if loss_name == "BCEWithLogitsLoss":
        return nn.BCEWithLogitsLoss()
    elif loss_name == "BCELoss":
        return nn.BCELoss()
    else:
        raise ValueError(f"Loss function '{loss_name}' not supported. "
                         "Check hyperparameter.py or add implementation here.")
    
# Optimizer
def get_optimizer(model, optimizer_name: str, learning_rate: float):
    """
        Optimizer 불러오기
    """
    if optimizer_name == "Adam":
        optimizer = Adam(model.parameters(), lr=learning_rate)
    elif optimizer_name == "SGD":
        optimizer = SGD(model.parameters(), lr=learning_rate, momentum=0.9)
    else:
        raise ValueError(f"Optimizer '{optimizer_name}' not supported.")
    
    return optimizer

# Learning Rate Scheduler
def get_scheduler(scheduler_param:dict=None, optimizer=None, num_epochs:int = 10):
    """
        scheduler 불러오기
    """

    if scheduler_param and optimizer:
        scheduler_name = scheduler_param["scheduler_name"]
        scheduler_mode = scheduler_param["scheduler_mode"]
        scheduler_patience = scheduler_param["scheduler_patience"]
        scheduler_factor = scheduler_param["scheduler_factor"]
        
        # 스케쥴러 설정 아래에 해주면 됩니다.
        if scheduler_name == "ReduceLROnPlateau":
            scheduler = ReduceLROnPlateau(optimizer, mode=scheduler_mode, 
                                        patience=scheduler_patience, factor=scheduler_factor)
        elif scheduler_name == "CosineAnnealingLR":
            scheduler = CosineAnnealingLR(optimizer, T_max=num_epochs) # T_max can be adjusted

        return scheduler

    else:
        print("scheduler 없음.")
        return
    
def train_one_epoch(model, dataloader, criterion, optimizer, device):
    """
        학습 & 역전파
    """
    model.train()
    running_loss = 0.0
    for images, masks in tqdm(dataloader, desc="Training"):
        images = images.to(device)
        masks = masks.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, masks)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)

    epoch_loss = running_loss / len(dataloader.dataset)
    return epoch_loss

def validate_one_epoch(model, dataloader, criterion, device):
    """
        Epoch마다 validation 데이터셋에 대해 성능 측정
    """
    model.eval()
    running_loss = 0.0
    total_iou = 0.0
    total_f1 = 0.0
    num_batches = 0

    with torch.no_grad():
        for images, masks in tqdm(dataloader, desc="Validating"):
            images = images.to(device)
            masks = masks.to(device)

            outputs = model(images)
            loss = criterion(outputs, masks) # Use same criterion as training
            running_loss += loss.item() * images.size(0)

            if isinstance(criterion, nn.BCEWithLogitsLoss):
                 predicted_masks = (torch.sigmoid(outputs) > 0.5).float()
            else:
                 predicted_masks = (outputs > 0.5).float()

            batch_iou, batch_f1 = calculate_metrics(predicted_masks, masks)
            total_iou += batch_iou
            total_f1 += batch_f1
            num_batches += 1

    epoch_loss = running_loss / len(dataloader.dataset)
    avg_iou = total_iou / num_batches if num_batches > 0 else 0.0
    avg_f1 = total_f1 / num_batches if num_batches > 0 else 0.0
    return epoch_loss, avg_iou, avg_f1