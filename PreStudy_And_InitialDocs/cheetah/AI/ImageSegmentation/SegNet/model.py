import torch.nn as nn
from torchvision.models import vgg16
from lightning_module.model import BaseSegmentationModule

class SegNetLightning(BaseSegmentationModule):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        vgg = vgg16(weights='DEFAULT')

        features = list(vgg.features.children())

        # 인코더
        self.enc1 = nn.Sequential(*features[0:4]) # Conv, ReLU, Conv, ReLU
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)

        self.enc2 = nn.Sequential(*features[5:9]) # Conv, ReLU, Conv, ReLU
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)

        self.enc3 = nn.Sequential(*features[10:16]) # Conv, ReLU, Conv, ReLU, Conv, ReLU
        self.pool3 = nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)

        self.enc4 = nn.Sequential(*features[17:23]) # Conv, ReLU, Conv, ReLU, Conv, ReLU
        self.pool4 = nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)

        self.enc5 = nn.Sequential(*features[24:30]) # Conv, ReLU, Conv, ReLU, Conv, ReLU
        self.pool5 = nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)

        # 디코더
        self.unpool5 = nn.MaxUnpool2d(kernel_size=2, stride=2)
        nn.MaxPool2d(kernel_size=2, stride=2, return_indices=True)
        self.dec5 = nn.Sequential(
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
        )

        self.unpool4 = nn.MaxUnpool2d(kernel_size=2, stride=2)
        self.dec4 = nn.Sequential(
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
        )

        self.unpool3 = nn.MaxUnpool2d(kernel_size=2, stride=2)
        self.dec3 = nn.Sequential(
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
        )

        self.unpool2 = nn.MaxUnpool2d(kernel_size=2, stride=2)
        self.dec2 = nn.Sequential(
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
        )

        self.unpool1 = nn.MaxUnpool2d(kernel_size=2, stride=2)
        self.dec1 = nn.Sequential(
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, self.hparams.num_classes, kernel_size=3, padding=1), # 최종 출력 채널
        )


    def forward(self, x):
        # 인코더
        enc1 = self.enc1(x)
        enc1, indices1 = self.pool1(enc1)

        enc2 = self.enc2(enc1)
        enc2, indices2 = self.pool2(enc2)

        enc3 = self.enc3(enc2)
        enc3, indices3 = self.pool3(enc3)

        enc4 = self.enc4(enc3)
        enc4, indices4 = self.pool4(enc4)

        enc5 = self.enc5(enc4)
        enc5, indices5 = self.pool5(enc5)

        # 디코더
        dec5 = self.unpool5(enc5, indices5, output_size=enc4.size()) # output_size 지정
        dec5 = self.dec5(dec5)

        dec4 = self.unpool4(dec5, indices4, output_size=enc3.size())
        dec4 = self.dec4(dec4)

        dec3 = self.unpool3(dec4, indices3, output_size=enc2.size())
        dec3 = self.dec3(dec3)

        dec2 = self.unpool2(dec3, indices2, output_size=enc1.size())
        dec2 = self.dec2(dec2)

        dec1 = self.unpool1(dec2, indices1, output_size=x.size()) # 원본 입력 크기로 복원
        dec1 = self.dec1(dec1)

        return dec1