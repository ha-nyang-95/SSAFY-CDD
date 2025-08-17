import os
import io
import json
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as T
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, field_validator
from botocore.exceptions import ClientError  # ClientError 임포트 추가
from contextlib import asynccontextmanager  # lifespan을 위한 임포트 추가
import logging

# --- 로깅 설정 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- 환경 설정 ---
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TILE_SIZE = 512
CONFIG_KEY = "config.json"

# --- 전역 변수 초기화 ---
model: "DeepLabV3Lightning | None" = None
s3_manager: "S3Manager | None" = None

# --- FastAPI 수명 주기 이벤트 (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 애플리케이션 시작 시 실행될 로직
    global model, s3_manager
    try:
        # S3Manager와 모델을 초기화합니다.
        from bucket import S3Manager
        from model import DeepLabV3Lightning

        s3_manager = S3Manager()
        logging.info(f"Successfully connected to S3 bucket: {s3_manager.bucket_name}")

        logging.info(f"Downloading configuration from s3://{s3_manager.bucket_name}/{CONFIG_KEY}...")
        config_buffer = io.BytesIO()
        s3_manager.download_fileobj(CONFIG_KEY, config_buffer)
        config_data = json.loads(config_buffer.getvalue().decode('utf-8'))
        model_s3_key = config_data.get("model_path")
        if not model_s3_key:
            raise KeyError("'model_path' not found in config.json")
        logging.info(f"Configuration loaded. Model path from S3: {model_s3_key}")

        logging.info(f"Loading model onto {DEVICE} from s3://{s3_manager.bucket_name}/{model_s3_key}...")
        weights_buffer = io.BytesIO()
        s3_manager.download_fileobj(model_s3_key, weights_buffer)
        
        model = DeepLabV3Lightning.load_from_checkpoint(
            weights_buffer,
            map_location=DEVICE,
            num_classes=1
        )
        model.eval()
        model.freeze()
        logging.info("Model loaded successfully from S3.")
    except Exception as e:
        logging.error(f"FATAL: Server startup failed - {e}", exc_info=True)
        model = None
        s3_manager = None
    
    yield  # 애플리케이션이 실행되는 동안 여기서 대기

    # 애플리케이션 종료 시 실행될 로직 (필요 시 추가)
    logging.info("Server is shutting down.")


# --- FastAPI 앱 인스턴스 생성 ---
app = FastAPI(lifespan=lifespan)


# --- 요청 Body 모델 (입력값 검증) ---
class InferenceRequest(BaseModel):
    file_name: str

    @field_validator('file_name')
    def validate_file_name(cls, v):
        if not v:
            raise ValueError("file_name must not be empty.")
        if not v.endswith('/'):
            raise ValueError("file_name must end with a '/'.")
        return v

# --- 백그라운드에서 실행될 실제 추론 작업 ---
def run_inference_task(request: InferenceRequest):
    if not s3_manager or not model:
        logging.error("Inference task skipped: Server is not ready (model or S3Manager not initialized).")
        return

    image_key = f"{request.file_name}image.jpeg"
    result_key = f"{request.file_name}segment.png"
    logging.info(f"Starting inference for {image_key}")

    try:
        # 1. S3에서 이미지 다운로드
        image_buffer = io.BytesIO()
        s3_manager.download_fileobj(image_key, image_buffer)
        original_image = Image.open(image_buffer).convert("RGB")
        logging.info(f"Successfully downloaded image: {image_key}")

        # 2. 이미지 타일링
        tiles = tile_image_with_dynamic_overlap(original_image, TILE_SIZE)
        
        # 3. 추론 수행
        transform = T.Compose([T.ToTensor()])
        width, height = original_image.size
        full_mask = torch.zeros((model.hparams.num_classes, height, width), device=DEVICE)

        with torch.no_grad():
            for item in tiles:
                input_tensor = transform(item["tile"]).unsqueeze(0).to(DEVICE)
                pred_mask = model.predict_step(input_tensor, 0).squeeze(0)
                x, y = item["coords"]

                # --- 핵심 수정 부분 ---
                # 1. 목적지(full_mask)에서 실제로 덮어쓸 영역의 끝 좌표를 계산합니다.
                #    (이미지 경계를 넘어가지 않도록 min 함수 사용)
                dest_y_end = min(y + TILE_SIZE, height)
                dest_x_end = min(x + TILE_SIZE, width)

                # 2. 덮어쓸 영역의 실제 높이와 너비를 계산합니다.
                slice_height = dest_y_end - y
                slice_width = dest_x_end - x

                # 3. 소스(pred_mask)에서 실제 크기만큼만 잘라내어 목적지에 덮어씁니다.
                full_mask[:, y:dest_y_end, x:dest_x_end] = pred_mask[:, :slice_height, :slice_width].float()
        logging.info("Inference on all tiles completed.")

        # 4. 결과 시각화 (알파 블렌딩)
        combined_mask = torch.any(full_mask.bool(), dim=0).cpu().numpy()
        result_image_np = np.array(original_image)
        opacity = 0.4
        overlay_color = np.array([255, 0, 0])
        original_pixels = result_image_np[combined_mask]
        blended_pixels = (original_pixels * (1 - opacity) + overlay_color * opacity).astype(np.uint8)
        result_image_np[combined_mask] = blended_pixels
        result_image = Image.fromarray(result_image_np)

        # 5. 결과 이미지를 S3에 업로드
        result_buffer = io.BytesIO()
        result_image.save(result_buffer, format="PNG")
        result_buffer.seek(0)
        s3_manager.upload_fileobj(result_buffer, result_key, content_type="image/png")
        
        logging.info(f"Inference task for {image_key} completed successfully. Result saved to {result_key}")

    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchKey':
            logging.error(f"File not found in S3: {image_key}")
        else:
            logging.error(f"An S3 client error occurred for {image_key}: {e}", exc_info=True)
    except Exception as e:
        logging.error(f"An unexpected error occurred during inference for {image_key}: {e}", exc_info=True)


def tile_image_with_dynamic_overlap(image: Image.Image, tile_size: int):
    width, height = image.size
    num_tiles_x = 1 if width <= tile_size else int(np.ceil(width / tile_size))
    num_tiles_y = 1 if height <= tile_size else int(np.ceil(height / tile_size))
    start_x = np.linspace(0, width - tile_size, num_tiles_x, dtype=int)
    start_y = np.linspace(0, height - tile_size, num_tiles_y, dtype=int)
    tiles = []
    for y in start_y:
        for x in start_x:
            tiles.append({"tile": image.crop((x, y, x + tile_size, y + tile_size)), "coords": (x, y)})
    return tiles

@app.post("/inference", status_code=202)
async def inference(request: InferenceRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_inference_task, request)
    return {"message": "Inference task has been accepted and is running in the background."}

if __name__ == "__main__":
    import uvicorn
    logging.info("Starting server. Ensure AWS environment variables are set.")
    uvicorn.run(app, host="0.0.0.0", port=8080)
    