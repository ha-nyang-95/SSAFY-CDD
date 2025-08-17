# -*- coding: utf-8 -*-
"""
YOLOv8을 이용한 균열 탐지(Crack Detection) 모델 학습 및 추론 스크립트 (ver. 2)

이 스크립트는 사전에 정의된 `dataset.yaml` 파일을 읽어와 작업을 수행합니다.
1. 설정(Configuration): 경로, 하이퍼파라미터 등 모든 설정을 상단에서 관리합니다.
2. 모델 학습: YOLOv8 모델을 지정된 데이터셋으로 학습시킵니다.
3. 모델 검증: 학습된 모델 중 최상의 성능을 보인 모델로 검증을 수행합니다.
4. 추론 및 시각화: 테스트 이미지를 사용하여 추론을 실행하고 결과를 시각화합니다.
"""

# ==============================================================================
# 1. 라이브러리 임포트 (Library Imports)
# ==============================================================================
import os
import yaml
import random
import numpy as np
import torch
import cv2
import matplotlib.pyplot as plt
from glob import glob
from ultralytics import YOLO

# ==============================================================================
# 2. 설정 (Configuration)
# - 모든 경로와 하이퍼파라미터는 이곳에서 관리합니다.
# ==============================================================================

# --- 경로 설정 (Path Configuration) ---
# **수정됨**: 이제 dataset.yaml 파일의 경로만 지정하면 됩니다.
# 스크립트 실행 위치를 기준으로 상대 경로를 사용하거나 절대 경로를 지정하세요.
DATASET_YAML_PATH = 'dataset/dataset.yaml'

# 결과물 저장 경로
OUTPUT_DIR = 'runs' # YOLO의 기본 출력 폴더명 'runs'를 사용하거나 '/kaggle/working' 등으로 변경


# --- 모델 및 학습 하이퍼파라미터 (Model & Training Hyperparameters) ---
SEED = 132
PRETRAINED_MODEL = "crack.pt"
EPOCHS = 20
IMG_SIZE = 512
BATCH_SIZE = 16
DEVICE = "0" # "0" for GPU, "cpu" for CPU
PROJECT_NAME = "crack_detect_v2"


# --- 추론 설정 (Inference Configuration) ---
CONF_THRESHOLD = 0.25


# ==============================================================================
# 3. 유틸리티 함수 (Utility Functions)
# ==============================================================================

def seed_everything(seed):
    """실험 재현성을 위한 시드 고정 함수"""
    random.seed(seed)
    np.random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    print(f"✅ 시드가 {seed}로 고정되었습니다.")

def load_yaml(file_path):
    """YAML 파일을 읽어와 내용을 반환하는 함수"""
    if not os.path.exists(file_path):
        print(f"🚨 에러: YAML 파일을 찾을 수 없습니다. 경로를 확인하세요: {file_path}")
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    print(f"✅ YAML 파일 로드 성공: {file_path}")
    return data


# ==============================================================================
# 4. 핵심 기능 함수 (Core Functions)
# ==============================================================================

def run_training(model, yaml_path, epochs, imgsz, batch_size, device, project_dir, name):
    """YOLO 모델 학습을 실행하고 결과 객체를 반환"""
    print("\n--- 🚀 모델 학습을 시작합니다 ---")
    results = model.train(
        data=yaml_path,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        project=project_dir,
        name=name,
        exist_ok=False # 같은 이름의 프로젝트가 있으면 에러 발생
    )
    save_dir = results.save_dir
    print(f"✅ 학습 완료! 결과는 다음 폴더에 저장되었습니다: {save_dir}")
    return results

def show_training_results(save_dir):
    """학습 결과(results.png)를 시각화"""
    print("\n--- 📊 학습 결과 그래프 확인 ---")
    loss_plot_path = os.path.join(save_dir, "results.png")
    if os.path.exists(loss_plot_path):
        img = plt.imread(loss_plot_path)
        plt.figure(figsize=(12, 6))
        plt.imshow(img)
        plt.axis("off")
        plt.title("Training Loss & Metrics")
        plt.show()
    else:
        print(f"경고: '{loss_plot_path}'에서 결과 이미지를 찾을 수 없습니다.")

def run_validation(model, yaml_path):
    """검증 데이터셋으로 모델 성능을 평가"""
    print("\n--- 📈 검증 데이터로 모델 성능을 평가합니다 ---")
    val_results = model.val(data=yaml_path)
    print("\n--- 검증 데이터 평가 결과 ---")
    print(f"  mAP50-95: {val_results.box.map:.4f}")
    print(f"     mAP50: {val_results.box.map50:.4f}")
    print(f" Precision: {val_results.box.mp:.4f}")
    print(f"    Recall: {val_results.box.mr:.4f}")
    print("--------------------------")
    return val_results

def run_inference(model, image_dir, conf_threshold):
    """테스트 이미지에 대한 추론을 수행하고 결과를 시각화"""
    print("\n--- 🔍 테스트 이미지로 추론을 실행합니다 ---")
    # YAML 경로가 상대경로일 경우를 대비하여 절대경로로 변환해줄 수 있습니다.
    # image_dir = os.path.abspath(image_dir)
    test_image_paths = sorted(glob(os.path.join(image_dir, "*.jpg")))
    if not test_image_paths:
        print(f"🚨 에러: '{image_dir}' 에서 테스트 이미지를 찾을 수 없습니다.")
        return

    test_img_path = random.choice(test_image_paths)
    print(f"추론 대상 이미지: {test_img_path}")
    predict_results = model.predict(source=test_img_path, conf=conf_threshold, save=False)

    result_img = predict_results[0].plot()  # plot()은 BGR 이미지를 반환
    result_img_rgb = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB) # Matplotlib을 위해 RGB로 변환

    plt.figure(figsize=(10, 10))
    plt.imshow(result_img_rgb)
    plt.axis("off")
    plt.title(f"Inference Result: {os.path.basename(test_img_path)}")
    plt.show()


# ==============================================================================
# 5. 메인 실행 블록 (Main Execution Block)
# ==============================================================================
if __name__ == '__main__':
    # 시드 고정
    seed_everything(SEED)

    # **수정됨**: 기존 YAML 파일을 로드합니다.
    dataset_info = load_yaml(DATASET_YAML_PATH)

    # YAML 파일 로드에 성공한 경우에만 아래 로직을 실행합니다.
    if dataset_info:
        # 1. 모델 학습
        model = YOLO(PRETRAINED_MODEL)
        train_results = run_training(
            model=model,
            yaml_path=DATASET_YAML_PATH, # YAML 경로를 직접 전달
            epochs=EPOCHS,
            imgsz=IMG_SIZE,
            batch_size=BATCH_SIZE,
            device=DEVICE,
            project_dir=OUTPUT_DIR,
            name=PROJECT_NAME
        )
        
        trained_save_dir = train_results.save_dir
        show_training_results(trained_save_dir)

        # 2. 모델 검증 (가장 성능 좋은 모델 가중치 사용)
        best_model_path = os.path.join(trained_save_dir, 'weights/best.pt')
        if os.path.exists(best_model_path):
            best_model = YOLO(best_model_path)
            run_validation(model=best_model, yaml_path=DATASET_YAML_PATH)

            # 3. 테스트 이미지 추론
            # **수정됨**: YAML에서 읽어온 test 경로를 사용합니다.
            test_image_dir = dataset_info.get('test')
            if test_image_dir:
                run_inference(model=best_model, image_dir=test_image_dir, conf_threshold=CONF_THRESHOLD)
            else:
                 print("🚨 경고: YAML 파일에 'test' 경로가 지정되지 않아 추론을 건너뜁니다.")
        else:
            print(f"🚨 경고: 최적 가중치 파일 '{best_model_path}'를 찾을 수 없어 검증 및 추론을 건너뜁니다.")