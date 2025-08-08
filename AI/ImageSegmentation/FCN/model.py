from lightning_module.model import BaseSegmentationModule  # BaseSegmentationModule 있는 위치에 맞게 경로 수정
from torchvision.models import vgg16, VGG16_Weights
import torch.nn as nn

class FCN8sLightning(BaseSegmentationModule):
    def __init__(self, num_classes=1, **kwargs):
        super().__init__(**kwargs)

        vgg = vgg16(weights=VGG16_Weights.IMAGENET1K_V1)
        features = list(vgg.features.children())

        self.layer1 = nn.Sequential(*features[:17])  # pool3, 1/8
        self.layer2 = nn.Sequential(*features[17:24])  # pool4, 1/16
        self.layer3 = nn.Sequential(*features[24:])  # pool5, 1/32

        self.score_layer3 = nn.Conv2d(512, num_classes, kernel_size=1)
        self.score_layer2 = nn.Conv2d(512, num_classes, kernel_size=1)
        self.score_layer1 = nn.Conv2d(256, num_classes, kernel_size=1)

        self.upscore2 = nn.ConvTranspose2d(num_classes, num_classes, 4, stride=2, padding=1, bias=False)
        self.upscore4 = nn.ConvTranspose2d(num_classes, num_classes, 4, stride=2, padding=1, bias=False)
        self.upscore8 = nn.ConvTranspose2d(num_classes, num_classes, 16, stride=8, padding=4, bias=False)

    def forward(self, x):
        x1 = self.layer1(x)
        x2 = self.layer2(x1)
        x3 = self.layer3(x2)

        score3 = self.score_layer3(x3)
        upscore3 = self.upscore2(score3)

        score2 = self.score_layer2(x2)
        fuse2 = upscore3 + score2
        upscore2 = self.upscore4(fuse2)

        score1 = self.score_layer1(x1)
        fuse1 = upscore2 + score1

        out = self.upscore8(fuse1)
        return out
