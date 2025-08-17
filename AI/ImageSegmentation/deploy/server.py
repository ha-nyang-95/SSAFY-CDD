import time
import io
import json
import logging
from contextlib import asynccontextmanager
import torch
from fastapi import FastAPI, BackgroundTasks, Request
from logger_config import setup_json_logger
from api_models import InferenceRequest
from inference_worker import run_inference_task
from bucket import S3Manager
from model import DeepLabV3Lightning
from monitoring_client import send_log_to_loki


setup_json_logger()

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TILE_SIZE = 512
CONFIG_KEY = "config.json"

model: "DeepLabV3Lightning | None" = None
s3_manager: "S3Manager | None" = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    서버 시작 시 모델과 S3 매니저를 초기화하고, 관련 이벤트를 Loki로 전송합니다.
    """
    global model, s3_manager
    logging.info("Server startup sequence initiated.")
    send_log_to_loki({"event_type": "server_startup_initiated"}, job_name="fastapi-server")
    
    try:
        s3_manager = S3Manager()
        logging.info(f"Successfully connected to S3 bucket: {s3_manager.bucket_name}")

        load_start = time.time()
        config_buffer = io.BytesIO()
        s3_manager.download_fileobj(CONFIG_KEY, config_buffer)
        config_data = json.loads(config_buffer.getvalue().decode('utf-8'))
        model_s3_key = config_data.get("model_path")
        if not model_s3_key:
            raise KeyError("'model_path' not found in config.json")

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
        load_end = time.time()

        duration = round(load_end - load_start, 4)
        logging.info("Model loaded successfully.", extra={"details": {"duration_seconds": duration}})
        send_log_to_loki({
            "event_type": "server_startup_success",
            "model_load_duration_seconds": duration,
            "device": str(DEVICE)
        }, job_name="fastapi-server")

    except Exception as e:
        logging.error(f"FATAL: Server startup failed - {e}", exc_info=True)
        send_log_to_loki({
            "event_type": "server_startup_failure",
            "status": "failed",
            "error": str(e)
        }, job_name="fastapi-server")
        model = None
        s3_manager = None
    
    yield

    logging.info("Server is shutting down.")
    send_log_to_loki({"event_type": "server_shutdown"}, job_name="fastapi-server")


app = FastAPI(lifespan=lifespan)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """모든 수신 HTTP 요청을 로깅하는 미들웨어"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    log_payload = {
        "event_type": "http_request",
        "method": request.method,
        "path": request.url.path,
        "client_ip": request.client.host,
        "status_code": response.status_code,
        "process_time_seconds": round(process_time, 4)
    }
    send_log_to_loki(log_payload, job_name="fastapi-requests")
    
    return response

@app.post("/inference", status_code=202)
async def inference(request: InferenceRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        run_inference_task, 
        request=request,
        model=model,
        s3_manager=s3_manager,
        device=DEVICE,
        tile_size=TILE_SIZE
    )
    return {"message": "Inference task has been accepted and is running in the background."}

if __name__ == "__main__":
    import uvicorn

    logging.info("Starting server with Uvicorn. Ensure AWS environment variables are set.")
    uvicorn.run(app, host="0.0.0.0", port=8080)
