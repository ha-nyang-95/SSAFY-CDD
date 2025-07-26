"""
TODO: K-fold datalaoder 구현
"""

import torch
import os
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from pathlib import Path
import numpy as np

class CrackDataset(Dataset):
    def __init__(self, image_dir, mask_dir, img_transform=None, mask_transform=None):
        self.image_dir = image_dir # Dataset_v0/train/images
        self.mask_dir = mask_dir   # Dataset_v0/train/masks
        self.img_transform = img_transform
        self.mask_transform = mask_transform
        self.images = []
        self.masks = []

        """
        K-fold 안쓰는 버전
        데이터 self.images에 다 합침
        """
        image_dir_path = Path(self.image_dir)
        mask_dir_path = Path(self.mask_dir)

        for sub_dir in image_dir_path.iterdir():
            if sub_dir.is_dir():
                for file_name in sub_dir.iterdir():
                    self.images.append(Path(sub_dir.name) / file_name.name)

        for sub_dir in mask_dir_path.iterdir():
            if sub_dir.is_dir():
                for file_name in sub_dir.iterdir():
                    self.masks.append(Path(sub_dir.name) / file_name.name)

        assert len(self.images) == len(self.masks), \
            f"Dataset error: num of Images != num of Masks"

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_name = self.images[idx]
        mask_name = self.masks[idx]

        img_path = os.path.join(self.image_dir, img_name)
        mask_path = os.path.join(self.mask_dir, mask_name)

        image = Image.open(img_path).convert("RGB")
        mask = Image.open(mask_path).convert("L")

        if self.img_transform:
            image = self.img_transform(image)
        if self.mask_transform:
            mask = self.mask_transform(mask)
        
        # BCEWithLogitsLoss requires target to be float
        mask = (mask > 0).float()

        return image, mask


def get_dataloaders(train_img_dir, train_mask_dir, val_img_dir, val_mask_dir, img_size=512,
                    batch_size=4, num_workers=4):
    img_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    mask_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
    ])

    train_dataset = CrackDataset(
        train_img_dir,
        train_mask_dir, 
        img_transform=img_transform, 
        mask_transform=mask_transform
    )
    
    val_dataset = CrackDataset(
        val_img_dir,
        val_mask_dir,
        img_transform=img_transform, 
        mask_transform=mask_transform                               
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers, persistent_workers=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, persistent_workers=True)

    return train_loader, val_loader