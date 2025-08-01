import torch.nn as nn
from torchvision.models.segmentation import deeplabv3_resnet101, DeepLabV3_ResNet101_Weights
from lightning_module.model import BaseSegmentationModule

class DeepLabV3Lightning(BaseSegmentationModule):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        weights = DeepLabV3_ResNet101_Weights.DEFAULT
        self.model = deeplabv3_resnet101(weights=weights)

        # 메인 분류기 (classifier)의 마지막 레이어 수정
        # DeepLabV3의 classifier는 보통 ASPP (Atrous Spatial Pyramid Pooling) 후에 옵니다.
        # 여기서 classifier[4] (torchvision 0.13.0 이전) 또는 classifier[-1] (torchvision 0.13.0 이후)를 수정합니다.
        # 최신 버전에서는 'classifier'가 nn.Sequential이고, 마지막 Conv2d가 인덱스 4에 위치하는 경우가 많습니다.
        # 정확한 인덱스는 모델 구조에 따라 다를 수 있으므로, print(self.model.classifier)로 확인하는 것이 좋습니다.
        in_channels_classifier = self.model.classifier[4].in_channels if hasattr(self.model.classifier, '__len__') and len(self.model.classifier) > 4 else 256 # 기본값 256
        self.model.classifier[4] = nn.Conv2d(in_channels_classifier, self.hparams.num_classes, kernel_size=(1, 1), stride=(1, 1))

        # 보조 분류기 (aux_classifier)가 있다면 그것도 수정
        if self.model.aux_classifier is not None:
            # 보조 분류기도 메인 분류기와 유사하게 마지막 Conv2d 레이어를 수정합니다.
            in_channels_aux_classifier = self.model.aux_classifier[4].in_channels if hasattr(self.model.aux_classifier, '__len__') and len(self.model.aux_classifier) > 4 else 256 # 기본값 256
            self.model.aux_classifier[4] = nn.Conv2d(in_channels_aux_classifier, self.hparams.num_classes, kernel_size=(1, 1), stride=(1, 1))

    def forward(self, x):
        output = self.model(x)['out']
        return output