# 3D Modeling (3D Gaussian Splatting)

드론이 촬영한 비행 영상을 입력받아 구조물 전체를 사실적인 3D 모델로 재구성하는 모듈입니다. **3D Gaussian Splatting** 기술을 적용하여 2D 프레임으로부터 3D 장면을 학습하고, 결과를 웹 브라우저에서 바로 볼 수 있는 `.splat` 포맷으로 변환합니다. GCP Cloud Run / Cloud Run Job 환경에서 GPU를 사용해 동작하도록 구성되어 있습니다.

</br>

## 📖 개요

- **입력** : S3에 업로드된 드론 비행 영상 (`{prefix}video.mp4`)
- **처리 파이프라인** :
  1. S3에서 영상 다운로드
  2. `ffmpeg`로 프레임 추출 (fps=2)
  3. `convert.py`(COLMAP)로 카메라 포즈 및 sparse point cloud 생성
  4. `train.py`로 3D Gaussian Splatting 학습 → `.ply` 생성
  5. `splat/convert.py`로 `.ply` → `.splat` 변환
  6. 결과 `.splat`을 S3에 업로드 (`{prefix}model.splat`)
- **출력** : `.splat` (WebGL 뷰어에서 렌더링 가능한 Gaussian Splatting 포맷)

비동기 처리를 위해 HTTP 요청은 GCP Pub/Sub 토픽(`modeling-jobs`)에 작업을 게시하고, 실제 무거운 연산은 Cloud Run Job(`modeling-job`)에서 수행합니다.

</br>

## 🗂️ 디렉토리 구조

```
3D_Modeling/
├── main.py                  # Flask 서버 + Cloud Run Job 진입점
├── requirements.txt         # Python 의존성 (Flask, torch cu118, moderngl, PyOpenGL 등)
├── Dockerfile               # 애플리케이션 이미지 (base 이미지 기반)
├── Dockerfile.base          # 무거운 의존성을 포함한 base 이미지
├── cloudbuild.yaml          # Cloud Build → Artifact Registry → Cloud Run 배포
├── cloudbuild.base.yaml     # base 이미지 빌드용 Cloud Build
└── 3D_gaussian_splatting/
    ├── gaussian-splatting/  # INRIA 3D Gaussian Splatting (convert.py / train.py)
    ├── splat/               # WebGL 뷰어 및 .ply → .splat 변환기 (convert.py)
    ├── requirements.txt
    └── README_Install.txt
```

</br>

## 🔧 의존성

`requirements.txt` 기준 주요 패키지입니다.

- **웹 서버** : `Flask==2.2.2`, `gunicorn==20.1.0`
- **딥러닝** : `torch==2.0.1`, `torchvision==0.15.2`, `torchaudio==2.0.2` (CUDA 11.8 / `--extra-index-url https://download.pytorch.org/whl/cu118`)
- **3D / 렌더링** : `moderngl==5.12.0`, `glcontext==3.0.0`, `PyOpenGL==3.1.9`, `PyOpenGL-accelerate==3.1.9`, `plyfile==1.1.2`
- **클라우드 / 큐** : `boto3==1.26.91`(S3), `google-cloud-pubsub==2.13.12`
- **빌드/유틸** : `ninja`, `pybind11`, `opencv-python==4.9.0.80`, `numpy==1.26.4`

> COLMAP, ffmpeg, CUDA 등 무거운 시스템 의존성은 `Dockerfile.base`에 사전 설치되어 base 이미지로 관리됩니다.

</br>

## ▶️ 실행 방법

### 1. 로컬 / 컨테이너 직접 실행

```bash
pip install -r requirements.txt

# API 서비스 모드 (Flask + gunicorn)
gunicorn --bind 0.0.0.0:8000 --workers 1 --threads 8 --timeout 0 main:app

# 또는 단일 작업(Job) 모드 — JOB_FILE_NAME 환경변수로 처리할 파일 prefix 지정
JOB_FILE_NAME="some/prefix/" python3 main.py
```

`main.py`는 `JOB_FILE_NAME` 환경변수 유무로 동작 모드를 분기합니다.
- 환경변수 있음 → `run_job()`을 실행해 전체 3D 모델링 파이프라인 수행
- 환경변수 없음 → Flask API 서버로 기동 (`POST /process`)

### 2. API 호출

```bash
curl -X POST http://<HOST>:8000/process \
  -H "Content-Type: application/json" \
  -d '{"file_name": "some/prefix/"}'
# → Pub/Sub(modeling-jobs)에 작업 게시 후 202 Accepted 반환
```

### 3. Docker 빌드

```bash
# base 이미지 (의존성 포함, 최초 1회)
docker build -f Dockerfile.base -t 3d-modeling-base .

# 애플리케이션 이미지
docker build -t modelingapi .
```

### 4. Cloud Build / Cloud Run 배포

`cloudbuild.yaml`이 빌드 → Artifact Registry 푸시 → Cloud Run 서비스(`modelingapi`) 배포 → Cloud Run Job(`modeling-job`) 업데이트까지 자동 수행합니다.

```bash
gcloud builds submit --config cloudbuild.yaml
```

- 서비스/Job 모두 GPU(`nvidia-l4`), CPU 4, 메모리 16Gi로 배포됩니다.
- AWS 자격증명(`AWS_ACCESS_KEY_ID` 등)은 Secret Manager에서 주입됩니다.

</br>

## 📌 서브모듈 / 업스트림 출처

본 모듈은 다음 외부 프로젝트를 포함합니다. 해당 디렉토리의 라이선스 및 README는 원저작자의 것을 따릅니다.

- **INRIA gaussian-splatting** (`3D_gaussian_splatting/gaussian-splatting/`)
  - 출처: <https://github.com/graphdeco-inria/gaussian-splatting>
  - 역할: COLMAP 전처리(`convert.py`) 및 3DGS 학습(`train.py`)
- **antimatter15/splat** (`3D_gaussian_splatting/splat/`)
  - 출처: <https://github.com/antimatter15/splat>
  - 역할: WebGL 기반 `.splat` 뷰어 및 `.ply → .splat` 변환기(`convert.py`)
