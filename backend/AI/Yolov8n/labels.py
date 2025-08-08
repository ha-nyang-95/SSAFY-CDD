import os
import json
import multiprocessing
from tqdm import tqdm

def convert_coco_to_yolo(image_width, image_height, bbox):
    """
    COCO 형식의 바운딩 박스를 YOLO 형식으로 변환합니다.
    COCO bbox = [x_min, y_min, width, height]
    YOLO format = [x_center_norm, y_center_norm, width_norm, height_norm]
    """
    x_center = bbox[0] + bbox[2] / 2
    y_center = bbox[1] + bbox[3] / 2
    x_center_norm = x_center / image_width
    y_center_norm = y_center / image_height
    width_norm = bbox[2] / image_width
    height_norm = bbox[3] / image_height
    return x_center_norm, y_center_norm, width_norm, height_norm

def process_single_file(args):
    """
    단일 파일에 대한 변환 작업을 수행하는 함수 (워커 프로세스가 실행).
    """
    image_filename, image_dir, label_source_dir, label_dest_dir = args
    
    base_filename = os.path.splitext(image_filename)[0]
    json_path = os.path.join(label_source_dir, f"{base_filename}.json")
    yolo_label_path = os.path.join(label_dest_dir, f"{base_filename}.txt")

    if not os.path.exists(json_path):
        # 파일이 없을 경우 오류 메시지 대신 None을 반환하여 조용히 처리
        return f"SKIP: {image_filename}"

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        image_info = data['images'][0]
        image_width = image_info['width']
        image_height = image_info['height']

        yolo_annotations = []
        for annotation in data['annotations']:
            class_id = annotation['category_id'] - 1
            bbox = annotation['bbox']
            x_center_norm, y_center_norm, width_norm, height_norm = convert_coco_to_yolo(image_width, image_height, bbox)
            yolo_annotations.append(f"{class_id} {x_center_norm} {y_center_norm} {width_norm} {height_norm}")

        with open(yolo_label_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(yolo_annotations))
        return None # 성공 시 반환값 없음
            
    except Exception as e:
        return f"ERROR: {image_filename} - {e}" # 오류 발생 시 파일명과 오류 메시지 반환

def process_dataset_parallel(image_dir, label_source_dir, label_dest_dir):
    """
    multiprocessing을 사용하여 데이터셋을 병렬로 처리합니다.
    """
    os.makedirs(label_dest_dir, exist_ok=True)
    
    image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff'))]
    
    # 각 파일에 대해 처리할 작업 목록 생성
    tasks = [(img_file, image_dir, label_source_dir, label_dest_dir) for img_file in image_files]

    print(f"'{image_dir}' 경로에 대한 병렬 처리 시작... 총 {len(tasks)}개 작업.")
    
    # 사용 가능한 CPU 코어 수만큼 프로세스 풀 생성
    # os.cpu_count()는 시스템의 CPU 코어 수를 반환합니다.
    num_processes = multiprocessing.cpu_count()
    print(f"{num_processes}개의 프로세스를 사용합니다.")

    with multiprocessing.Pool(processes=num_processes) as pool:
        # tqdm을 사용하여 진행 상황 시각화
        # imap_unordered는 작업을 순서에 상관없이 완료되는 대로 결과를 반환하여 효율적입니다.
        results = list(tqdm(pool.imap_unordered(process_single_file, tasks), total=len(tasks), desc=f"Processing {os.path.basename(image_dir)}"))

    # 오류가 발생한 파일 목록 출력
    errors = [r for r in results if r is not None]
    if errors:
        print(f"\n처리 중 다음 {len(errors)}개의 파일에서 문제가 발생했습니다:")
        for error in errors:
            print(error)

    print(f"'{label_dest_dir}' 경로에 라벨 파일 저장 완료.")

# 멀티프로세싱을 사용하려면 메인 실행 부분을 `if __name__ == '__main__':` 블록 안에 두어야 합니다.
# 이는 새로운 프로세스가 스크립트 코드를 다시 실행하는 것을 방지하는 중요한 역할을 합니다.
if __name__ == '__main__':
    # --- 경로 설정 ---

    # 1. 원본 이미지 파일 경로
    train_img_dir = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\train\images'
    test_img_dir = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\test\images'
    val_img_dir = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\val\images'

    # 2. 원본 라벨(JSON) 파일이 있는 경로
    original_label_dir = r'G:\내 드라이브\SSAFY\공통프로젝트\data2\112.건물 균열 탐지드론 개발을 위한 이미지\01.데이터\ObjectDetection\라벨링데이터_240326_add\콘크리트_콘크리트균열_라벨링_02'

    # 3. 변환된 라벨(YOLO .txt) 파일을 저장할 경로
    train_label_dest = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\train\labels'
    test_label_dest = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\test\labels'
    val_label_dest = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset\val\labels'
    
    # --- 데이터 처리 실행 ---
    
    process_dataset_parallel(train_img_dir, original_label_dir, train_label_dest)
    print("-" * 70)
    
    process_dataset_parallel(test_img_dir, original_label_dir, test_label_dest)
    print("-" * 70)

    process_dataset_parallel(val_img_dir, original_label_dir, val_label_dest)
    print("-" * 70)

    print("✅ 모든 데이터셋의 병렬 처리가 완료되었습니다.")