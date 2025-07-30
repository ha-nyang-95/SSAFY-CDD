import os
import sys
import torch
import numpy as np
import cv2
from torchvision import transforms
from pytorch_lightning import seed_everything
from lightning_module.factory import get_segmentation_model_class
from util import MODEL_NAME_MAP

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
seed_everything(102, workers=True)

transform = transforms.Compose([
    transforms.ToTensor(),
])

def tile_image(image, tile_h=192, tile_w=320, stride_h=192, stride_w=320):
    H, W, _ = image.shape
    tiles, coords = [], []
    for y in range(0, H, stride_h):
        for x in range(0, W, stride_w):
            y_end = min(y + tile_h, H)
            x_end = min(x + tile_w, W)
            tile = image[y:y_end, x:x_end]

            pad_h = tile_h - tile.shape[0]
            pad_w = tile_w - tile.shape[1]
            if pad_h > 0 or pad_w > 0:
                tile = cv2.copyMakeBorder(tile, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=(0, 0, 0))

            tiles.append(tile)
            coords.append((x, y))
    return tiles, coords, H, W

def merge_visualized_tiles(tiles, coords, full_shape, tile_h=192, tile_w=320):
    H, W = full_shape
    merged = np.zeros((H, W, 3), dtype=np.float32)
    for tile, (x, y) in zip(tiles, coords):
        y_end = min(y + tile_h, H)
        x_end = min(x + tile_w, W)
        h = y_end - y
        w = x_end - x
        merged[y:y_end, x:x_end] += tile[:h, :w].astype(np.float32)
    return np.clip(merged, 0, 255).astype(np.uint8)

def visualize_prediction_mask(image, prob_map, threshold=0.2, alpha=0.5):
    mask = (prob_map > threshold).astype(np.uint8)
    red_overlay = np.zeros_like(image)
    red_overlay[:, :, 0] = 255
    blended = cv2.addWeighted(image, 1 - alpha, red_overlay, alpha, 0)
    result = image.copy()
    result[mask == 1] = blended[mask == 1]
    return result

def batch_predict(model, tile_images, batch_size=4):
    preds = []
    for i in range(0, len(tile_images), batch_size):
        batch = tile_images[i:i+batch_size]
        tensors = torch.stack([transform(tile).float() for tile in batch]).to(DEVICE)
        with torch.no_grad():
            output = model(tensors)
            probs = torch.sigmoid(output).squeeze(1).cpu().numpy()
            preds.extend(probs)
    return np.array(preds)

def process_single_image(model, image_path, save_path):
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    tiles, coords, H, W = tile_image(image_rgb)
    probs = batch_predict(model, tiles)
    visualized_tiles = [visualize_prediction_mask(tile, prob) for tile, prob in zip(tiles, probs)]
    result = merge_visualized_tiles(visualized_tiles, coords, (H, W))
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

    # ✅ 수정된 모델 불러오기 방식
    model_class = get_segmentation_model_class(model_name)
    model = model_class.load_from_checkpoint(ckpt_path).to(DEVICE)
    model.eval()

    os.makedirs(output_path, exist_ok=True)
    valid_exts = [".jpg", ".jpeg", ".png", ".bmp", ".tif"]

    for fname in os.listdir(input_path):
        if any(fname.lower().endswith(ext) for ext in valid_exts):
            input_img_path = os.path.join(input_path, fname)
            output_img_path = os.path.join(output_path, f"result_{fname}")
            process_single_image(model, input_img_path, output_img_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❗Usage: python test.py <model_name>")
        sys.exit(1)

    model_name = sys.argv[1].lower()
    if model_name not in MODEL_NAME_MAP:
        print(f"❗지원하지 않는 모델 이름입니다: {model_name}")
        sys.exit(1)

    main(model_name)
