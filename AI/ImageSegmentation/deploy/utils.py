import numpy as np
from PIL import Image

def tile_image_with_dynamic_overlap(image: Image.Image, tile_size: int) -> list[dict]:
    """
    이미지를 동적 오버랩을 사용하여 타일로 분할하는 함수입니다.

    Args:
        image (Image.Image): 분할할 PIL 이미지 객체.
        tile_size (int): 타일의 크기 (정사각형).

    Returns:
        list[dict]: 각 타일의 이미지와 좌표를 담은 딕셔너리 리스트.
    """
    width, height = image.size
    
    # 이미지가 타일 크기보다 작거나 같으면 타일링 없이 전체 이미지를 반환
    if width <= tile_size and height <= tile_size:
        return [{"tile": image, "coords": (0, 0)}]

    # 각 축에 필요한 타일 수 계산
    num_tiles_x = 1 if width <= tile_size else int(np.ceil(width / tile_size))
    num_tiles_y = 1 if height <= tile_size else int(np.ceil(height / tile_size))

    # 타일이 시작될 x, y 좌표 계산 (이미지 경계를 넘지 않도록)
    start_x = np.linspace(0, width - tile_size, num_tiles_x, dtype=int) if width > tile_size else [0]
    start_y = np.linspace(0, height - tile_size, num_tiles_y, dtype=int) if height > tile_size else [0]
    
    tiles = []
    for y in start_y:
        for x in start_x:
            # crop() 메서드를 사용하여 이미지 자르기
            tile = image.crop((x, y, x + tile_size, y + tile_size))
            tiles.append({"tile": tile, "coords": (x, y)})
            
    return tiles
