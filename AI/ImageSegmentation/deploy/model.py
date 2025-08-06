import torch
import torch.nn as nn
import pytorch_lightning as pl
from torchvision.models.segmentation import deeplabv3_resnet101


class DeepLabV3Lightning(pl.LightningModule):
    """
    PyTorch Lightning 모듈을 직접 상속받는 DeepLabV3+ 모델입니다.
    이 모듈은 추론(inference)에 사용하기 위해 최적화되었습니다.
    """
    def __init__(self, num_classes: int = 1, threshold: float = 0.5):
        super().__init__()
        # num_classes, threshold와 같은 하이퍼파라미터를 저장합니다.
        self.save_hyperparameters()

        self.model = deeplabv3_resnet101(weights=None, aux_loss=True)

        in_channels_classifier = self.model.classifier[4].in_channels
        self.model.classifier[4] = nn.Conv2d(in_channels_classifier, self.hparams.num_classes, kernel_size=(1, 1), stride=(1, 1))

        if self.model.aux_classifier is not None:
            in_channels_aux = self.model.aux_classifier[4].in_channels
            self.model.aux_classifier[4] = nn.Conv2d(in_channels_aux, self.hparams.num_classes, kernel_size=(1, 1), stride=(1, 1))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        모델의 순전파 로직을 정의합니다.
        BCEWithLogitsLoss에 맞게 마지막 활성화 함수(Sigmoid)가 없는 로짓(logits)을 반환합니다.
        """
        return self.model(x)['out']

    def predict_step(self, batch: torch.Tensor, batch_idx: int, dataloader_idx: int = 0) -> torch.Tensor:
        """
        추론 시 사용되는 로직입니다. BCEWithLogitsLoss로 학습된 모델의 출력을 처리합니다.
        """
        # 입력 배치가 리스트나 튜플인 경우, 첫 번째 요소를 이미지로 간주합니다.
        if isinstance(batch, (list, tuple)):
            batch = batch[0]
        
        # 1. 모델로부터 로짓(logits)을 얻습니다. (출력 형태: [N, C, H, W])
        logits = self(batch)
        
        # 2. 로짓에 Sigmoid 함수를 적용하여 각 클래스에 대한 픽셀별 확률을 계산합니다.
        probs = torch.sigmoid(logits)
        
        # 3. 확률이 임계값(hparams.threshold)을 넘는지 확인하여 최종 예측 마스크를 생성합니다.
        # 이 결과는 (N, C, H, W) 형태의 0 또는 1 값을 갖는 텐서가 됩니다.
        # 각 채널(C)은 특정 클래스에 대한 이진 마스크(binary mask)를 나타냅니다.
        preds = (probs > self.hparams.threshold).int()
        
        return preds