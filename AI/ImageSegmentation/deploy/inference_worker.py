import time
import io
import logging
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as T
from botocore.exceptions import ClientError
import pynvml
import psutil

from utils import tile_image_with_dynamic_overlap
from api_models import InferenceRequest
from monitoring_client import send_log_to_loki

# RPS 계산을 위한 전역 변수
request_count = 0
last_rps_time = time.time()

def get_system_metrics():
    """pynvml과 psutil을 사용하여 시스템 메트릭을 가져옵니다."""
    global request_count, last_rps_time
    metrics = {
        "cpu_usage_percent": psutil.cpu_percent(),
        "memory_usage_percent": psutil.virtual_memory().percent,
        "gpu_usage_percent": None,
        "gpu_memory_usage_percent": None,
        "rps": 0
    }
    try:
        pynvml.nvmlInit()
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
        memory_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        metrics["gpu_usage_percent"] = utilization.gpu
        metrics["gpu_memory_usage_percent"] = (memory_info.used / memory_info.total) * 100
    except pynvml.NVMLError as e:
        logging.warning(f"Could not get GPU metrics: {e}")
    finally:
        try:
            pynvml.nvmlShutdown()
        except pynvml.NVMLError:
            pass

    # RPS 계산
    current_time = time.time()
    time_delta = current_time - last_rps_time
    if time_delta > 1: # 1초마다 RPS 계산
        metrics["rps"] = request_count / time_delta
        request_count = 0
        last_rps_time = current_time

    return metrics

def run_inference_task(
    request: InferenceRequest, 
    model: torch.nn.Module, 
    s3_manager, 
    device: torch.device, 
    tile_size: int
):
    global request_count
    request_count += 1

    if not s3_manager or not model:
        logging.error("Inference task skipped: Server is not ready.", extra={"details": {"event_type": "inference_failure"}})
        return

    image_key = f"{request.file_name}image.jpeg"
    result_key = f"{request.file_name}segment.png"
    logging.info(f"Starting inference for {image_key}", extra={"details": {"event_type": "inference_start", "image_key": image_key}})

    try:
        # 1. S3에서 이미지 다운로드 및 기본 정보 추출
        image_buffer = io.BytesIO()
        s3_manager.download_fileobj(image_key, image_buffer)
        original_image = Image.open(image_buffer).convert("RGB")
        
        width, height = original_image.size
        image_np = np.array(original_image)
        avg_pixel_value = float(image_np.mean())

        # 2. 이미지 타일링
        tiles = tile_image_with_dynamic_overlap(original_image, tile_size)
        
        # 3. 추론 수행 및 시간 측정 (배치 처리 방식으로 개선)
        transform = T.Compose([T.ToTensor()])
        full_mask = torch.zeros((model.hparams.num_classes, height, width), device=device)
        
        inference_start = time.time()
        with torch.no_grad():
            # 3.1. 모든 타일을 텐서로 변환하고 하나의 배치로 결합
            tile_tensors = [transform(item["tile"]) for item in tiles]
            batch_tensor = torch.stack(tile_tensors).to(device)

            # 3.2. 배치 전체를 모델에 한 번에 전달하여 추론 수행
            batch_preds = model.predict_step(batch_tensor, 0)

            # 3.3. 결과 배치를 순회하며 원래 마스크에 재조립
            for i, item in enumerate(tiles):
                pred_mask = batch_preds[i]  # i번째 예측 결과를 가져옴. 형태: [C, H, W]
                x, y = item["coords"]
                dest_y_end, dest_x_end = min(y + tile_size, height), min(x + tile_size, width)
                slice_height, slice_width = dest_y_end - y, dest_x_end - x
                full_mask[:, y:dest_y_end, x:dest_x_end] = pred_mask[:, :slice_height, :slice_width].float()
        inference_end = time.time()
        inference_duration = inference_end - inference_start

        # 4. 추론 결과 분석 (후처리 최적화)
        # GPU에서 마스크를 결합하고, CPU로 전체 마스크를 옮기는 대신 GPU에서 바로 좌표를 찾습니다.
        combined_mask_gpu = torch.any(full_mask.bool(), dim=0)

        # 결과 이미지 생성을 위해 CPU NumPy 배열로 변환
        combined_mask = combined_mask_gpu.cpu().numpy()

        # GPU에서 균열 좌표를 찾습니다.
        crack_pixels_yx_gpu = torch.nonzero(combined_mask_gpu)

        # 훨씬 작은 크기의 좌표 데이터만 CPU로 이동합니다.
        crack_pixels_yx = crack_pixels_yx_gpu.cpu().numpy()
        crack_pixels_xy = crack_pixels_yx[:, ::-1].tolist() if crack_pixels_yx.size > 0 else []

        # 5. 커스텀 로그 생성 및 Loki로 전송
        system_metrics = get_system_metrics()
        log_payload = {
            "event_type": "inference_log",
            "image_key": image_key,
            "cpu_usage_percent": system_metrics["cpu_usage_percent"],
            "memory_usage_percent": system_metrics["memory_usage_percent"],
            "gpu_usage_percent": system_metrics["gpu_usage_percent"],
            "gpu_memory_usage_percent": system_metrics["gpu_memory_usage_percent"],
            "rps": system_metrics["rps"],
            "inference_latency_seconds": round(inference_duration, 4),
            "image_avg_brightness": round(avg_pixel_value, 2),
            "crack_pixels_count": len(crack_pixels_xy),
            "crack_distribution": get_crack_distribution(crack_pixels_xy, (width, height))
        }
        send_log_to_loki(log_payload, job_name="ai-inference-worker")

        # 6. 결과 시각화 및 S3 업로드
        result_image = create_result_image(original_image, combined_mask)
        upload_result_to_s3(s3_manager, result_image, result_key)

    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        logging.error(f"S3 client error: {error_code}", exc_info=True, extra={"details": {"event_type": "s3_error", "image_key": image_key, "error_code": error_code}})
    except Exception as e:
        logging.error(f"An unexpected error occurred during inference", exc_info=True, extra={"details": {"event_type": "inference_exception", "image_key": image_key}})

def get_crack_distribution(crack_pixels, resolution):
    """균열 좌표를 10x10 그리드 기준으로 분포를 계산합니다."""
    width, height = resolution
    grid = np.zeros((10, 10), dtype=int)
    for x, y in crack_pixels:
        grid_x = int((x / width) * 10)
        grid_y = int((y / height) * 10)
        if 0 <= grid_x < 10 and 0 <= grid_y < 10:
            grid[grid_y, grid_x] += 1
    return grid.tolist()

def create_result_image(original_image: Image.Image, mask: np.ndarray) -> Image.Image:
    """원본 이미지에 마스크를 오버레이하여 결과 이미지를 생성합니다."""
    result_image_np = np.array(original_image)
    overlay_color, opacity = np.array([255, 0, 0]), 0.4
    result_image_np[mask] = (result_image_np[mask] * (1 - opacity) + overlay_color * opacity).astype(np.uint8)
    return Image.fromarray(result_image_np)

def upload_result_to_s3(s3_manager, result_image: Image.Image, result_key: str):
    """결과 이미지를 S3에 업로드합니다."""
    result_buffer = io.BytesIO()
    result_image.save(result_buffer, format="PNG")
    result_buffer.seek(0)
    s3_manager.upload_fileobj(result_buffer, result_key, content_type="image/png")
    logging.info(f"Result saved to {result_key}", extra={"details": {"event_type": "upload_complete", "result_key": result_key}})
