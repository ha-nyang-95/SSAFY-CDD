import torch.nn as nn
from torchvision.models import vgg16
from lightning_module.model import BaseSegmentationModule

class SegNetLightning(BaseSegmentationModule):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        vgg = vgg16(weights='DEFAULT')

        features = list(vgg.features.children())

        # 인코더
        self.enc1 = nn.Sequential(*features[0:5])
        self.enc2 = nn.Sequential(*features[5:10])
        self.enc3 = nn.Sequential(*features[10:17])
        self.enc4 = nn.Sequential(*features[17:24])
        self.enc5 = nn.Sequential(*features[24:31])

        # 디코더
        self.dec5 = nn.Sequential(
            nn.ConvTranspose2d(512, 512, kernel_size=2, stride=2),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
        )
        self.dec4 = nn.Sequential(
            nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
        )
        self.dec3 = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
        )
        self.dec2 = nn.Sequential(
            nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
        )
        self.dec1 = nn.Sequential(
            nn.ConvTranspose2d(64, self.hparams.num_classes, kernel_size=2, stride=2),
        )

    def forward(self, x):
        enc1 = self.enc1(x)
        enc2 = self.enc2(enc1)
        enc3 = self.enc3(enc2)
        enc4 = self.enc4(enc3)
        enc5 = self.enc5(enc4)

        dec5 = self.dec5(enc5)
        dec4 = self.dec4(dec5)
        dec3 = self.dec3(dec4)
        dec2 = self.dec2(dec3)
        dec1 = self.dec1(dec2)

        return dec1