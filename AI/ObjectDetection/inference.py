

import os
import time
import glob
import cv2
import numpy as np
from ultralytics import YOLO

def run_batch_inference_and_eval(weights_path='best_weights.pt', test_images_path='dataset/test/images', data_yaml_path='dataset/data.yaml'):
    """
    지정된 가중치를 사용하여 테스트 데이터셋의 모든 이미지에 대해 추론을 실행하고,
    성능(평균 추론 시간, FPS) 및 정확도(mAP)를 평가합니다.
    """
    # --- 1. 사전 확인 ---
    if not os.path.exists(weights_path):
        print(f"오류: '{weights_path}'에서 가중치 파일을 찾을 수 없습니다.")
        print("먼저 train.py를 실행하여 가중치 파일을 생성해주세요.")
        return

    if not os.path.exists(test_images_path):
        print(f"오류: '{test_images_path}'에서 테스트 이미지 디렉토리를 찾을 수 없습니다.")
        return
    
    if not os.path.exists(data_yaml_path):
        print(f"오류: '{data_yaml_path}'에서 데이터 YAML 파일을 찾을 수 없습니다.")
        return

    # --- 2. 모델 로드 ---
    try:
        print(f"가중치 파일 로드 중: {weights_path}")
        model = YOLO(weights_path)
        print("모델 로드 완료.")
    except Exception as e:
        print(f"모델 로드 중 오류 발생: {e}")
        return

    # --- 3. mAP 성능 평가 ---
    print("\nmAP 성능 평가를 시작합니다...")
    try:
        metrics = model.val(data=data_yaml_path, split='test', save_json=True)
        print("\n--- mAP 평가 결과 ---")
        print(f"mAP50-95: {metrics.box.map:.4f}")
        print(f"mAP50: {metrics.box.map50:.4f}")
        print("--------------------")
    except Exception as e:
        print(f"mAP 평가 중 오류 발생: {e}")

    # --- 4. 추론 속도 및 FPS 측정 ---
    print("\n추론 속도 및 FPS 측정을 시작합니다...")
    image_paths = glob.glob(os.path.join(test_images_path, '*.*'))
    if not image_paths:
        print(f"'{test_images_path}'에서 이미지를 찾을 수 없습니다.")
        return

    inference_times = []
    
    # 결과를 저장할 디렉토리 생성
    output_dir = 'runs/detect'
    os.makedirs(output_dir, exist_ok=True)

    for image_path in image_paths:
        try:
            start_time = time.time()
            
            # 추론 실행
            results = model(image_path, verbose=False)
            
            end_time = time.time()
            inference_times.append(end_time - start_time)

            # 결과 이미지 저장
            output_filename = os.path.basename(image_path)
            output_path = os.path.join(output_dir, f'inference_result_{output_filename}')
            annotated_image = results[0].plot()
            cv2.imwrite(output_path, annotated_image)

        except Exception as e:
            print(f"'{image_path}' 추론 중 오류 발생: {e}")
    
    # --- 5. 성능 결과 출력 ---
    if inference_times:
        avg_inference_time = np.mean(inference_times)
        fps = 1 / avg_inference_time
        
        print("\n--- 추론 성능 분석 ---")
        print(f"총 이미지 수: {len(image_paths)}")
        print(f"평균 추론 시간: {avg_inference_time:.4f} 초")
        print(f"초당 프레임 (FPS): {fps:.2f}")
        print("-----------------------")
        print(f"추론 결과는 '{os.path.abspath(output_dir)}' 디렉토리에 저장되었습니다.")
    else:
        print("추론을 완료한 이미지가 없어 성능을 분석할 수 없습니다.")


if __name__ == '__main__':
    run_batch_inference_and_eval()
