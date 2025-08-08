import os
import shutil
import mlflow
from ultralytics import YOLO
from dataloader import get_data_config_path
from config import HYPERPARAMETERS

def train_model():
    # mlflow 세팅
    mlflow.set_experiment("YOLOv8 Crack Detection")

    # 모델 경로를 절대 경로로 지정
    model_path = os.path.abspath(HYPERPARAMETERS.get('model', 'yolov8n.pt'))
    model = YOLO(model_path)

    data_config_path = get_data_config_path()

    # Ultralytics의 train 함수는 내부적으로 MLflow 로깅을 처리합니다.
    # `with mlflow.start_run()` 블록을 사용하면 중복/충돌이 발생할 수 있습니다.
    # 따라서 `train`을 먼저 호출하고, 반환된 결과에서 run ID를 얻어 추가 로깅을 진행합니다.
    results = model.train(
        data=data_config_path,
        **HYPERPARAMETERS
    )

    # Ultralytics가 생성한 MLflow run을 가져옵니다.
    # Ultralytics 8.0.190 이상에서는 `results.run_id`로 바로 접근 가능합니다.
    # 하위 호환성을 위해 `getattr`을 사용합니다.
    run_id = getattr(results, 'run_id', None)

    if run_id:
        with mlflow.start_run(run_id=run_id, nested=True):
            print(f"Re-opening MLflow Run ID: {run_id} to log additional artifacts.")
            
            # 하이퍼파라미터는 Ultralytics가 자동으로 로깅하므로 중복 로깅을 피할 수 있습니다.
            # 필요하다면 여기에 추가 파라미터를 로깅할 수 있습니다.
            # mlflow.log_params(HYPERPARAMETERS)

            # 학습된 가중치 아티팩트로 저장
            best_weights_path = os.path.join(results.save_dir, 'weights/best.pt')
            destination_path = 'best_weights.pt' # 파일 이름 변경 (선택 사항)
            
            if os.path.exists(best_weights_path):
                shutil.copyfile(best_weights_path, destination_path)
                print(f"Best weights saved to {os.path.abspath(destination_path)}")
                
                mlflow.log_artifact(destination_path, artifact_path="weights")
                print("Logged best weights as an MLflow artifact.")
            else:
                print("Could not find best.pt.")
    else:
        print("Could not retrieve MLflow Run ID from training results. Skipping additional logging.")
        # MLflow 로깅이 비활성화된 경우, 가중치만 로컬에 저장
        best_weights_path = os.path.join(results.save_dir, 'weights/best.pt')
        destination_path = 'best_weights.pt'
        if os.path.exists(best_weights_path):
            shutil.copyfile(best_weights_path, destination_path)
            print(f"Best weights saved to {os.path.abspath(destination_path)}")


if __name__ == '__main__':
    train_model()