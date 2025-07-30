import os
from PIL import Image

# 변환할 이미지가 있는 상위 폴더 목록
original_img_dir_list = [
    '콘크리트_콘크리트균열_원천_38',
    '콘크리트_콘크리트균열_원천_39',
    '콘크리트_콘크리트균열_원천_40',
    '콘크리트_콘크리트균열_원천_41',
    '콘크리트_콘크리트균열_원천_42'
]

# 원본 이미지가 있는 최상위 경로
original_img_base_path = r'G:\내 드라이브\SSAFY\공통프로젝트\data2\112.건물 균열 탐지드론 개발을 위한 이미지\01.데이터\ObjectDetection\원천데이터'

# 변환된 JPG 파일을 저장할 경로 정의
base_output_path = r'C:\Users\SSAFY\Desktop\S13P11B102\AI\Yolov8n\dataset'
train_dir_path = os.path.join(base_output_path, 'train\\images')
val_dir_path = os.path.join(base_output_path, 'val\\images')
test_dir_path = os.path.join(base_output_path, 'test\\images')


def convert_tiff_to_jpg(tiff_file_path: str, output_dir_path: str) -> None:
    """
    TIFF(.tiff, .tif) 파일을 가져와 JPG(.jpg) 파일로 변환합니다.
    지정된 출력 폴더에 저장합니다.

    Args:
        tiff_file_path (str): 변환할 원본 TIFF 파일의 전체 경로.
        output_dir_path (str): 결과물을 저장할 폴더 경로.
    """
    # 1. 파일 존재 여부 및 형식 확인
    if not os.path.exists(tiff_file_path):
        print(f"오류: 파일을 찾을 수 없습니다 -> '{tiff_file_path}'")
        return
    if not tiff_file_path.lower().endswith(('.tiff', '.tif')):
        return

    # 2. 출력 파일 경로 결정
    base_filename = os.path.basename(tiff_file_path)
    jpg_filename = os.path.splitext(base_filename)[0] + '.jpg'
    
    os.makedirs(output_dir_path, exist_ok=True)
    output_jpg_path = os.path.join(output_dir_path, jpg_filename)

    # 3. 이미지 변환 및 저장
    try:
        with Image.open(tiff_file_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            print(f"'{base_filename}' 파일 변환 중...")
            img.save(output_jpg_path, 'jpeg')
            print(f"✅ 성공: '{output_jpg_path}' 경로에 파일이 생성되었습니다.")
    except Exception as e:
        print(f"❌ 오류: '{tiff_file_path}' 파일 변환 중 문제가 발생했습니다. -> {e}")


if __name__ == '__main__':
    for dir_name in original_img_dir_list:
        source_dir_path = os.path.join(original_img_base_path, dir_name)
        
        if not os.path.isdir(source_dir_path):
            print(f"경고: 디렉토리를 찾을 수 없습니다 -> '{source_dir_path}'")
            continue
            
        # ⭐핵심: 폴더 이름에 따라 저장 경로를 다르게 설정
        if dir_name == '콘크리트_콘크리트균열_원천_42':
            output_path = test_dir_path
        elif dir_name == '콘크리트_콘크리트균열_원천_41':
            output_path = val_dir_path
        else:
            output_path = train_dir_path
            
        file_list = os.listdir(source_dir_path)
        
        print(f"\n--- '{source_dir_path}' 디렉토리 처리 시작 ---")
        print(f"--- 저장 위치: '{output_path}' ---")
        
        for file_name in file_list:
            tiff_full_path = os.path.join(source_dir_path, file_name)
            # 결정된 output_path를 인자로 전달
            convert_tiff_to_jpg(tiff_full_path, output_path)