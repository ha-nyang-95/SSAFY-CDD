pip install -r requirements.txt 한 다음 아래 명령어 각각 실행

pip install -e gaussian-splatting/submodules/simple-knn --no-build-isolation --config-settings editable_mode=compat
pip install -e gaussian-splatting/submodules/diff-gaussian-rasterization --no-build-isolation --config-settings editable_mode=compat
pip install -e gaussian-splatting/submodules/fused-ssim --no-build-isolation --config-settings editable_mode=compat
conda install -n <env이름> -c conda-forge ffmpeg
conda install -c conda-forge colmap

아래 명령어 하나씩 실행

cd test
mkdir -p data/images 
mkdir -p data/input_video

(data/input_video에 영상 업로드)

ffmpeg -i data/input_video/<****.mp4> -vf fps=10 data/images/%05d.jpg

or

mkdir -p data/images
count=1

for f in data/input_video/*.mp4; do
    # 현재 mp4에서 프레임 추출
    ffmpeg -i "$f" -vf fps=10 "data/images/tmp_%05d.jpg"

    # 추출된 프레임을 차례대로 이름 변경
    for img in data/images/tmp_*.jpg; do
        new_name=$(printf "data/images/%05d.jpg" "$count")
        mv "$img" "$new_name"
        count=$((count + 1))
    done
done


1. COLMAP으로 포즈 추정(1, 2 중 선택. 1 추천)

cd ~/test/data
mkdir -p colmap sparse

1) 한번에 실행
### 1)feature_extractor → 2)exhaustive_matcher → 3)mapper → 4)image_undistorter
cd ~/test/gaussian-splatting
python convert.py \
  --source_path /home/j-i13b102/test/data \
  --camera OPENCV \
  --image_dir images

2) 나눠서 실행
cd ~/test/data
### 특징 추출
colmap feature_extractor \
  --database_path colmap/database.db \
  --image_path images \
  --ImageReader.single_camera 1 \
  --SiftExtraction.use_gpu 1

### 특징 매칭
colmap exhaustive_matcher \
  --database_path colmap/database.db \
  --SiftMatching.use_gpu 1

### 스파스 리컨(매핑)
colmap mapper \
  --database_path colmap/database.db \
  --image_path images \
  --output_path sparse

### bin -> txt 확장자 변환
colmap model_converter \
  --input_path /home/j-i13b102/test/data/sparse/0 \
  --output_path /home/j-i13b102/test/data/sparse/0 \
  --output_type TXT

### 언디스토트
cd ~/test/gaussian-splatting

python convert.py \
  --source_path /home/j-i13b102/test/data \
  --camera OPENCV \
  --image_dir images \
  --skip_matching

2. 학습 -> 렌더
cd /home/j-i13b102/test/gaussian-splatting
# 학습 (VRAM 빠듯하면 --sh_degree 2 같이 낮추기)
이걸로 -> python train.py -s output/bdee3aa6-f --batch_size 4 --iterations 30000 --disable_viewer


이건 x -> python train.py \
  -s /home/j-i13b102/test/data \
  -m /home/j-i13b102/test/data/output/IMG7767_run1 \
  --iterations 30000

# 렌더
python render.py \
  -s /home/j-i13b102/test/data \
  -m /home/j-i13b102/test/data/output/IMG7767_run1



---> point_cloud.ply 파일 생성


SIBR_gaussianViewer_app.exe -m "C:\Users\SSAFY\Desktop\aka"

python splat/convert.py ./model.ply --out ./model.splat
