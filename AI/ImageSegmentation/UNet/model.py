import torch
import torch.nn as nn
from torchvision.models import vgg16 # VGG16을 인코더 백본으로 사용할 경우


class DoubleConv(nn.Module):
    """
    U-Net의 기본 빌딩 블록: 두 번의 Convolution + BatchNorm + ReLU
    """
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


class Down(nn.Module):
    """
    인코더의 다운샘플링 블록: MaxPool2d 후 DoubleConv
    """
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.maxpool_conv = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x):
        return self.maxpool_conv(x)


class Up(nn.Module):
    """
    디코더의 업샘플링 블록: ConvTranspose2d 후 스킵 커넥션 연결 및 DoubleConv
    """
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
        # 스킵 커넥션에서 오는 특징 맵과 합쳐진 후의 DoubleConv
        self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1, x2):
        # x1은 디코더의 현재 단계 특징 맵
        # x2는 인코더에서 스킵 커넥션으로 오는 특징 맵

        x1 = self.up(x1)
        # x1과 x2의 크기 불일치 조정 (패딩 등으로)
        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]

        x1 = torch.nn.functional.pad(x1, [diff_x // 2, diff_x - diff_x // 2,
                                        diff_y // 2, diff_y - diff_y // 2])
        
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class UNet(nn.Module):
    def __init__(self, n_channels=3, num_classes=1):
        super(UNet, self).__init__()
        self.n_channels = n_channels
        self.num_classes = num_classes

        # 인코더 (다운샘플링 경로)
        self.inc = DoubleConv(n_channels, 64)
        self.down1 = Down(64, 128)
        self.down2 = Down(128, 256)
        self.down3 = Down(256, 512)
        self.down4 = Down(512, 1024)

        # 디코더 (업샘플링 경로)
        self.up1 = Up(1024, 512)
        self.up2 = Up(512, 256)
        self.up3 = Up(256, 128)
        self.up4 = Up(128, 64)

        # 최종 출력 레이어
        self.outc = nn.Conv2d(64, num_classes, kernel_size=1)
        self.sigmoid = nn.Sigmoid() # 이진 분류 (균열/비균열)를 위한 시그모이드 레이어

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

        x = self.up1(x5, x4)
        x = self.up2(x, x3)
        x = self.up3(x, x2)
        x = self.up4(x, x1)

        logits = self.outc(x)

        output = self.sigmoid(logits)
        
        return output
    
def get_segmentation_model(model_name: str, num_classes: int):
    """
    팩토리 메서드: U-Net 모델을 생성하여 반환합니다.
    다른 모델과 독립적으로, 해당 모델 파일 내에서만 U-Net을 생성합니다.

    Args:
        model_name (str): 'unet'이어야 합니다. 다른 문자열이 오면 에러를 발생시킵니다.
        num_classes (int): 출력 클래스의 개수 (예: 균열/비균열 = 2).

    Returns:
        nn.Module: UNet 모델 인스턴스.

    Raises:
        ValueError: model_name이 'unet'이 아닌 경우 발생.
    """
    if model_name.lower() == 'unet':
        # n_channels는 기본적으로 3 (RGB 이미지)으로 설정합니다.
        return UNet(num_classes=num_classes)
    else:
        raise ValueError(f"Model {model_name} not supported in this file.")