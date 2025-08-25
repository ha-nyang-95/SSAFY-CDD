# convert.py  —  COLMAP → Gaussian Splatting 변환 (images 디렉터리 사용)
# Copyright (C) 2023, Inria
# GRAPHDECO research group, https://team.inria.fr/graphdeco
# License: see LICENSE.md (research/non-commercial)

import os
import shutil
import logging
import subprocess
from argparse import ArgumentParser
from pathlib import Path

def run(cmd:list, env=None):
    print("[RUN]", " ".join(cmd))
    subprocess.run(cmd, check=True, env=env)

def ensure_dir(p:Path):
    p.mkdir(parents=True, exist_ok=True)

def main():
    parser = ArgumentParser("Colmap converter (images-layout friendly)")
    parser.add_argument("--no_gpu", action='store_true')
    parser.add_argument("--skip_matching", action='store_true')
    parser.add_argument("--source_path", "-s", required=True, type=str)
    parser.add_argument("--camera", default="OPENCV", type=str)
    parser.add_argument("--colmap_executable", default="colmap", type=str)
    parser.add_argument("--resize", action="store_true")
    parser.add_argument("--magick_executable", default="magick", type=str)
    parser.add_argument("--image_dir", default="images", type=str, help="이미지 폴더 이름 (기본: images). 필요하면 input 등으로 바꿔 사용.")
    args = parser.parse_args()

    # 경로 정리
    source = Path(os.path.expanduser(args.source_path)).resolve()
    image_dir = source / args.image_dir
    # 백워드 호환: images가 없고 input만 있으면 input 사용
    if not image_dir.is_dir():
        alt = source / "input"
        if alt.is_dir():
            image_dir = alt
        else:
            raise FileNotFoundError(f"이미지 폴더를 찾을 수 없습니다: {image_dir} 또는 {alt}")

    use_gpu = "1" if not args.no_gpu else "0"
    colmap = args.colmap_executable
    magick = args.magick_executable

    distorted = source / "distorted"
    database = distorted / "database.db"
    distorted_sparse = distorted / "sparse"
    out_sparse_root = source / "sparse"        # undistort 후 COLMAP이 만드는 루트
    out_sparse_0 = out_sparse_root / "0"

    try:
        if not args.skip_matching:
            # 초기화
            ensure_dir(distorted_sparse)

            # 1) feature_extractor
            run([
                colmap, "feature_extractor",
                "--database_path", str(database),
                "--image_path", str(image_dir),
                "--ImageReader.single_camera", "1",
                "--ImageReader.camera_model", args.camera
            ])

            # 2) exhaustive_matcher
            run([
                colmap, "exhaustive_matcher",
                "--database_path", str(database)
            ])

            # 3) mapper (sparse 재구성)
            run([
                colmap, "mapper",
                "--database_path", str(database),
                "--image_path", str(image_dir),
                "--output_path", str(distorted_sparse),
                "--Mapper.ba_global_function_tolerance=0.000001"
            ])

            mapper_out = distorted_sparse / "0"
            if not mapper_out.is_dir():
                raise RuntimeError(f"Mapper 결과가 없습니다: {mapper_out}")

        else:
            # 스킵 모드: 기존 sparse/0 재사용
            # 우선순위: source/sparse/0 → distorted/sparse/0
            mapper_out = source / "sparse" / "0"
            if not mapper_out.is_dir():
                fallback = distorted_sparse / "0"
                if fallback.is_dir():
                    mapper_out = fallback
                else:
                    raise FileNotFoundError(
                        f"--skip_matching 이지만 기존 COLMAP 결과를 찾지 못했습니다.\n"
                        f"필요 경로: {source/'sparse/0'} (또는 {distorted_sparse/'0'})"
                    )

        # 4) image_undistorter → source/ (images, sparse 생성)
        run([
            colmap, "image_undistorter",
            "--image_path", str(image_dir),
            "--input_path", str(mapper_out),
            "--output_path", str(source),
            "--output_type", "COLMAP",
        ])

        # COLMAP은 source/sparse/{cameras.txt,...} 로 내보낼 때가 있어서 0/ 아래로 정리
        if out_sparse_root.is_dir():
            ensure_dir(out_sparse_0)
            for f in out_sparse_root.iterdir():
                if f.name == "0":
                    continue
                if f.is_file():
                    # 파일을 0/ 로 이동(기존 있으면 덮어쓰기)
                    shutil.move(str(f), str(out_sparse_0 / f.name))

        # 5) (옵션) 리사이즈 세트 만들기
        if args.resize:
            print("Copying and resizing...")
            sizes = [("images_2", "50%"), ("images_4", "25%"), ("images_8", "12.5%")]
            src_dir = source / "images"  # undistorter 후 표준명
            if not src_dir.is_dir():
                # 만약 undistorter가 images를 만들지 않았다면 image_dir 그대로 사용
                src_dir = image_dir
            for out_name, scale in sizes:
                dst_dir = source / out_name
                ensure_dir(dst_dir)
                for name in os.listdir(src_dir):
                    src_file = src_dir / name
                    if not src_file.is_file():
                        continue
                    dst_file = dst_dir / name
                    shutil.copy2(src_file, dst_file)
                    # ImageMagick mogrify
                    run([magick, "mogrify", "-resize", scale, str(dst_file)])

        print("Done.")
    except subprocess.CalledProcessError as e:
        logging.error(f"COLMAP 명령 실패: {e}")
        raise
    except Exception as e:
        logging.error(str(e))
        raise

if __name__ == "__main__":
    main()
