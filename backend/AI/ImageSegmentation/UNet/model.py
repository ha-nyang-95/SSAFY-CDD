import torch
import torch.nn as nn
import torch.optim as optim
from torchvision.models import vgg16, VGG16_Weights
import torch.nn.functional as F
from lightning_module.model import BaseSegmentationModule


class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)


class Up(nn.Module):
    def __init__(self, in_channels, out_channels, bilinear=True):
        super().__init__()
        
        # 업샘플링 방식 선택: Bilinear Interpolation 또는 Transposed Convolution
        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels)
        else:
            self.up = nn.ConvTranspose2d(in_channels // 2, in_channels // 2, kernel_size=2, stride=2)
            self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1, x2):
        x1 = self.up(x1)
        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]

        if diff_x > 0 or diff_y > 0:
            x1 = F.pad(x1, [diff_x // 2, diff_x - diff_x // 2,
                            diff_y // 2, diff_y - diff_y // 2])
        
        x = torch.cat([x2, x1], dim=1)
    
        return self.conv(x)


class UNetLightning(BaseSegmentationModule):
    def __init__(self, num_classes: int = 1, learning_rate: float = 1e-4, lr_factor: float = 0.1, bilinear: bool = True, **kwargs):
        super().__init__(**kwargs)
        
        self.vgg = vgg16(weights=VGG16_Weights.IMAGENET1K_V1).features
        
        self.e1_block = self.vgg[:4]
        self.p1 = self.vgg[4]

        self.e2_block = self.vgg[5:9]
        self.p2 = self.vgg[9]

        self.e3_block = self.vgg[10:16]
        self.p3 = self.vgg[16]

        self.e4_block = self.vgg[17:23]
        self.p4 = self.vgg[23]

        self.bottleneck_block = self.vgg[24:30]

        self.up4 = Up(512 + 512, 512, bilinear)
        self.up3 = Up(512 + 256, 256, bilinear)
        self.up2 = Up(256 + 128, 128, bilinear)
        self.up1 = Up(128 + 64, 64, bilinear)

        self.conv_out = nn.Conv2d(64, self.hparams.num_classes, kernel_size=1)


    def forward(self, x):
        e1 = self.e1_block(x) # Output: 64 channels
        p1 = self.p1(e1)      # MaxPool

        e2 = self.e2_block(p1) # Output: 128 channels
        p2 = self.p2(e2)

        e3 = self.e3_block(p2) # Output: 256 channels
        p3 = self.p3(e3)

        e4 = self.e4_block(p3) # Output: 512 channels
        p4 = self.p4(e4)

        b = self.bottleneck_block(p4) # Output: 512 channels

        x = self.up4(b, e4)
        x = self.up3(x, e3)
        x = self.up2(x, e2)
        x = self.up1(x, e1)

        out = self.conv_out(x)
        return out
    
    def configure_optimizers(self):
        """
        U-Net에서 encoder, decoder에 다른 학습률(learning_rate)을 적용하기 위해 오버라이딩
        """
        encoder_params = []
        decoder_params = []

        for name, param in self.named_parameters():
            if "vgg" in name:
                encoder_params.append(param)
            else:
                decoder_params.append(param)

        optimizer = optim.Adam([
            {'params': encoder_params, 'lr': self.hparams.learning_rate * self.hparams.lr_factor},
            {'params': decoder_params, 'lr': self.hparams.learning_rate}
        ])
        return optimizer