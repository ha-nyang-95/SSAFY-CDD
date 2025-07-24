import torch.nn as nn
from torchvision.models import vgg16
from torchvision.models.segmentation import deeplabv3_resnet101, DeepLabV3_ResNet101_Weights


class DeepLabV3(nn.Module):
    def __init__(self, num_classes=1):
        super(DeepLabV3, self).__init__()


        weights = DeepLabV3_ResNet101_Weights.DEFAULT
        self.model = deeplabv3_resnet101(weights=weights)

        self.model.classifier[2] = nn.Conv2d(256, num_classes, kernel_size=(1, 1), stride=(1, 1))

        if self.model.aux_classifier is not None:
            self.model.aux_classifier[2] = nn.Conv2d(256, num_classes, kernel_size=(1, 1), stride=(1, 1))
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        output = self.model(x)['out']
        output = self.sigmoid(output)
        return output
    
def get_segmentation_model(model_name: str, num_classes: int):
    """
    Factory method to get different segmentation models.

    Args:
        model_name (str): 모델 이름
        num_classes (int): 모델이 추론할 class의 개수

    Returns:
        nn.Module: 요청한 모델 객체
    """
    if model_name.lower() == 'deeplab':
        return DeepLabV3(num_classes=num_classes)
    else:
        raise ValueError(f"Model {model_name} not supported in this file.")