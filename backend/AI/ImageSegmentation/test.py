import os
import sys
import torch
import numpy as np
import cv2
from torchvision import transforms
from pytorch_lightning import seed_everything
from lightning_module.factory import get_segmentation_model_class
from util import MODEL_NAME_MAP
from tiler import Tiler, Merger

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
seed_everything(102, workers=True)

TILE_HEIGHT = 192
TILE_WIDTH = 320
STRIDE_HEIGHT = 288
STRIDE_WIDTH = 480
THRESHOLD = 0.2
ALPHA = 0.6
BATCH_SIZE = 4

transform = transforms.Compose([
    transforms.ToTensor(),
])

def visualize_prediction_mask(image, prob_map, threshold, alpha):
    mask = (prob_map > threshold).astype(np.uint8)
    red_overlay = np.zeros_like(image)
    red_overlay[:, :, 0] = 255
    blended = cv2.addWeighted(image, 1 - alpha, red_overlay, alpha, 0)
    result = image.copy()
    result[mask == 1] = blended[mask == 1]
    return result

def batch_predict(model, tile_images, batch_size):
    preds = []
    for i in range(0, len(tile_images), batch_size):
        batch = tile_images[i:i+batch_size]
        processed = []
        for tile in batch:
            tile = np.asarray(tile)
            if tile.ndim == 4 and tile.shape[0] == 1:
                tile = np.squeeze(tile, axis=0)
            if tile.ndim != 3:
                raise ValueError(f"[❌] Invalid tile shape after squeeze: {tile.shape}")
            if tile.dtype != np.uint8:
                tile = tile.astype(np.uint8)

            tensor = transform(tile).float()
            processed.append(tensor)

        tensors = torch.stack(processed).to(DEVICE)
        with torch.no_grad():
            output = model(tensors)
            probs = torch.sigmoid(output).squeeze(1).cpu().numpy()
            preds.extend(probs)

    return np.array(preds)

def process_single_image(model, image_path, save_path,
                         tile_h, tile_w, stride_h, stride_w,
                         threshold, alpha, batch_size):
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_h, image_w, _ = image_rgb.shape

    tiler = Tiler(
        data_shape=image_rgb.shape,
        tile_shape=(tile_h, tile_w, 3),
        overlap=(stride_h - tile_h, stride_w - tile_w, 0),
        channel_dimension=2
    )

    tile_list = []

    for tile_id in range(len(tiler)):
        tile = tiler.get_tile(image_rgb, tile_id)
        tile_list.append(tile)

    probs = batch_predict(model, tile_list, batch_size)

    merger = Merger(tiler)

    for tile_id, (tile, prob) in enumerate(zip(tile_list, probs)):
        vis_tile = visualize_prediction_mask(tile, prob, threshold, alpha)
        # tile_id 강제 int형 변환 (np.integer도 방지)
        tile_id_safe = int(tile_id)
        merger.add(tile_id_safe, vis_tile)


    result = merger.merge(dtype=np.uint8)

    avg_conf = np.mean(probs)
    cv2.putText(result, f"Avg Confidence: {avg_conf:.4f}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3)
    cv2.putText(result, f"Avg Confidence: {avg_conf:.4f}", (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 1)

    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    cv2.imwrite(save_path, cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
    print(f"[✅ 저장 완료] {save_path}")


def main(model_name):
    model_dir = MODEL_NAME_MAP[model_name]
    ckpt_path = os.path.join(model_dir, "checkpoint", f"{model_dir}_best_model.ckpt")
    input_path = "dataset/test"
    output_path = os.path.join(model_dir, "result")

    if not os.path.exists(ckpt_path):
        print(f"❗모델 체크포인트가 존재하지 않습니다: {ckpt_path}")
        sys.exit(1)

    model_class = get_segmentation_model_class(model_name)
    model = model_class.load_from_checkpoint(ckpt_path).to(DEVICE)
    model.eval()

    os.makedirs(output_path, exist_ok=True)
    valid_exts = [".jpg", ".jpeg", ".png", ".bmp", ".tif"]

    for fname in os.listdir(input_path):
        if any(fname.lower().endswith(ext) for ext in valid_exts):
            input_img_path = os.path.join(input_path, fname)
            output_img_path = os.path.join(output_path, f"result_{fname}")
            process_single_image(
                model,
                input_img_path,
                output_img_path,
                TILE_HEIGHT,
                TILE_WIDTH,
                STRIDE_HEIGHT,
                STRIDE_WIDTH,
                THRESHOLD,
                ALPHA,
                BATCH_SIZE
            )

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❗Usage: python test.py <model_name>")
        sys.exit(1)

    model_name = sys.argv[1].lower()
    if model_name not in MODEL_NAME_MAP:
        print(f"❗지원하지 않는 모델 이름입니다: {model_name}")
        sys.exit(1)

    main(model_name)
