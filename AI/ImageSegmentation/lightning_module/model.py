import torch
import torch.nn as nn
import torch.optim as optim
import pytorch_lightning as pl
from torchmetrics import Accuracy, JaccardIndex, F1Score

class BaseSegmentationModule(pl.LightningModule):
    def __init__(self, **kwargs):
        super().__init__()
        self.save_hyperparameters()

        # 손실 함수
        self.criterion = nn.BCEWithLogitsLoss()

        # 성능 평가 지표
        self.train_iou = JaccardIndex(task="binary")
        self.train_f1 = F1Score(task="binary")
        self.train_accuracy = Accuracy(task="binary")

        self.val_iou = JaccardIndex(task="binary")
        self.val_f1 = F1Score(task="binary")
        self.val_accuracy = Accuracy(task="binary")

        self.test_iou = JaccardIndex(task="binary")
        self.test_f1 = F1Score(task="binary")
        self.test_accuracy = Accuracy(task="binary")

    def _shared_step(self, batch, batch_idx, stage: str):
        """
        훈련 및 검증 스텝에서 공통적으로 사용되는 로직
        """
        inputs, targets = batch
        outputs = self(inputs) # 자식 클래스의 forward 메서드를 호출

        # Align dimensions
        outputs = outputs.squeeze(1)
        targets = targets.squeeze(1)

        # 손실 계산: targets는 BCEWithLogitsLoss를 위해 float 타입이어야 합니다.
        loss = self.criterion(outputs, targets.float())

        # 지표 계산: 로짓 -> 확률 -> 이진 예측
        probs = torch.sigmoid(outputs)
        preds = (probs > 0.5).long() # 이진 분류 (0 또는 1) 픽셀 단위 예측

        # 지표 업데이트
        if stage == "train":
            self.train_iou.update(preds, targets)
            self.train_f1.update(preds, targets)
            self.train_accuracy.update(preds, targets)
            metrics = {
                f"{stage}_loss": loss,
                f"{stage}_iou": self.train_iou,
                f"{stage}_f1": self.train_f1,
                f"{stage}_acc": self.train_accuracy
            }
        elif stage == "val":
            self.val_iou.update(preds, targets)
            self.val_f1.update(preds, targets)
            self.val_accuracy.update(preds, targets)
            metrics = {
                f"{stage}_loss": loss,
                f"{stage}_iou": self.val_iou,
                f"{stage}_f1": self.val_f1,
                f"{stage}_acc": self.val_accuracy
            }
        else:
            metrics = {
                f"{stage}_loss": loss,
                f"{stage}_iou": self.test_iou,
                f"{stage}_f1": self.test_f1,
                f"{stage}_acc": self.test_accuracy
            }

        # 지표 로깅
        self.log_dict(metrics, on_step=(stage=="train"), on_epoch=True, prog_bar=True, logger=True)
        return loss

    def training_step(self, batch, batch_idx):
        return self._shared_step(batch, batch_idx, "train")

    def validation_step(self, batch, batch_idx):
        return self._shared_step(batch, batch_idx, "val")

    def test_step(self, batch, batch_idx):
        return self._shared_step(batch, batch_idx, "test")

    def configure_optimizers(self):
        optimizer = self.get_optimizer()
        if self.hparams.scheduler is None:
            return optimizer

        if self.hparams.scheduler == "CosineAnnealingLR":
            scheduler = optim.lr_scheduler.CosineAnnealingLR(
                optimizer,
                T_max=self.hparams.T_max,
                eta_min=self.hparams.eta_min
            )
            return [optimizer], [scheduler]
        elif self.hparams.scheduler == "ReduceLROnPlateau":
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(
                optimizer,
                mode=self.hparams.scheduler_mode,
                factor=self.hparams.scheduler_factor,
                patience=self.hparams.scheduler_patience,

            )
            return {
                "optimizer": optimizer,
                "lr_scheduler": {
                    "scheduler": scheduler,
                    "monitor": "val_loss",
                }
            }
        else:
            raise ValueError(f"Scheduler {self.hparams.scheduler} not supported.")

    def get_optimizer(self):
        if self.hparams.optimizer == "Adam":
            optimizer = optim.Adam(self.parameters(), lr=self.hparams.learning_rate)
        elif self.hparams.optimizer == "SGD":
            optimizer = optim.SGD(self.parameters(), lr=self.hparams.learning_rate)
        elif self.hparams.optimizer == "AdamW":
            optimizer = optim.AdamW(
                self.parameters(),
                lr=self.hparams.learning_rate,
                weight_decay=self.hparams.weight_decay
            )
        else:
            raise ValueError(f"Optimizer {self.hparams.optimizer} not supported.")
        return optimizer