def calculate_iou(preds, targets, smooth=1e-6):
    """
    Calculates the Intersection over Union (IoU) for a batch of predictions.
    Args:
        preds (torch.Tensor): 모델의 예측값
        targets (torch.Tensor): 레이블
        smooth (float): 0으로 나누는 문제 해결하기 위한 값
    Returns:
        float: Mean IoU for the batch.
    """
    preds = preds.view(-1)
    targets = targets.view(-1)

    intersection = (preds * targets).sum()
    total = (preds + targets).sum()
    union = total - intersection

    iou = (intersection + smooth) / (union + smooth)
    return iou.item()

def calculate_f1_score(preds, targets, smooth=1e-6):
    """
    Calculates the F1 Score (Dice Score) for a batch of predictions.
    Args:
        preds (torch.Tensor): 모델 예측값
        targets (torch.Tensor): 레이블
        smooth (float): 0으로 나누는 문제 해결을 위한 값
    Returns:
        float: Mean F1 Score (Dice Score) for the batch.
    """
    preds = preds.view(-1)
    targets = targets.view(-1)

    intersection = (preds * targets).sum()
    dice = (2. * intersection + smooth) / (preds.sum() + targets.sum() + smooth)
    return dice.item()

def calculate_metrics(preds, targets):
    """
    Calculates mIoU and F1 Score for a batch of predictions.
    Args:
        preds (torch.Tensor): 모델의 예측값
        targets (torch.Tensor): 레이블
    Returns:
        tuple: (mean_iou, mean_f1_score)
    """

    batch_size = preds.shape[0]
    total_iou = 0.0
    total_f1 = 0.0

    for i in range(batch_size):
        total_iou += calculate_iou(preds[i], targets[i])
        total_f1 += calculate_f1_score(preds[i], targets[i])

    mean_iou = total_iou / batch_size
    mean_f1 = total_f1 / batch_size

    return mean_iou, mean_f1