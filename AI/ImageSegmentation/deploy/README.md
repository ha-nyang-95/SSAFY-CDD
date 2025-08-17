# AI Image Segmentation Server with Custom Monitoring

이 프로젝트는 균열 이미지 분할(Image Segmentation) AI 모델을 기반으로 하는 추론 서버와, 해당 서버의 성능 및 상태를 모니터링하기 위한 커스텀 로깅 시스템을 구축하는 과정을 담고 있습니다.

## 1. 프로젝트 개요

*   **AI 추론 서버:** Cloud Run 환경에서 Docker 컨테이너로 배포될 예정인 FastAPI 기반의 이미지 분할 추론 서버입니다.
*   **모니터링 서버:** 별도의 VM에 배포될 Loki와 Grafana를 활용한 모니터링 스택입니다.

## 2. 모니터링 아키텍처

AI 추론 서버는 Cloud Run 환경에서 실행되며, 커스텀 정의된 로그 데이터를 HTTP POST 요청을 통해 VM에 배포된 Loki 서버로 직접 전송(Push)합니다. Grafana는 Loki를 데이터 소스로 사용하여 이 로그 데이터를 시각화합니다.

```
[AI Inference Server (Cloud Run)] --(HTTP POST Custom Logs)--> [Loki (on VM)] <-- (Query) --> [Grafana (on VM)]
```

## 3. 수행된 작업 상세

### 3.1. AI 추론 서버 코드 수정

AI 추론 서버가 커스텀 로그를 수집하고 Loki로 전송하도록 코드를 수정했습니다.

*   **`requirements.txt` 수정:**
    *   `requests`: Loki로 HTTP 요청을 보내기 위해 추가.
    *   `psutil`, `pynvml`: CPU, 메모리, GPU 사용량 등 시스템 메트릭 수집을 위해 유지.

*   **`monitoring_client.py` 신규 생성:**
    *   Loki의 PUSH API 형식에 맞춰 로그 데이터를 전송하는 헬퍼 함수 `send_log_to_loki`를 구현했습니다.
    *   네트워크 초기화 지연 등의 문제에 대응하기 위해 **재시도(Retry) 로직**이 포함되어 안정적인 로그 전송을 보장합니다.
    *   `LOKI_URL` 환경 변수를 통해 Loki 서버의 주소를 설정합니다.

*   **`inference_worker.py` 수정:**
    *   기존 Prometheus 관련 로직을 제거했습니다.
    *   추론 완료 시점에 CPU 사용량, 메모리 사용량, GPU 사용량, GPU 메모리 사용량, RPS (Requests Per Second), 추론 지연 시간, 이미지 평균 밝기, 추론 결과 분포(균열 위치) 등 요청된 모든 커스텀 메트릭을 수집합니다.
    *   수집된 메트릭을 `monitoring_client.py`의 `send_log_to_loki` 함수를 통해 Loki로 전송합니다.

*   **`server.py` 수정:**
    *   기존 Prometheus 관련 코드를 모두 제거하여 코드를 정리했습니다.

*   **`Dockerfile` 수정:**
    *   `pynvml` 사용을 위한 `ENV NVIDIA_DRIVER_CAPABILITIES all` 환경 변수를 추가했습니다.

### 3.2. 모니터링 스택 설정

VM에 배포될 모니터링 스택(Loki, Grafana)을 위한 설정 파일을 준비했습니다.

*   **`monitoring/` 디렉토리 생성:** 모니터링 관련 파일들을 위한 디렉토리.

*   **`monitoring/docker-compose.yml` 작성:**
    *   Loki와 Grafana 서비스를 정의하여 컨테이너로 실행할 수 있도록 합니다.
    *   Loki는 `3100`번 포트, Grafana는 `3000`번 포트를 노출합니다.
    *   `loki_data`와 `grafana_data`라는 Docker 볼륨을 사용하여 데이터 영속성을 확보합니다.
    *   (테스트 목적으로 `ai-server` 서비스가 임시로 추가되었으나, 실제 배포 시에는 Cloud Run에서 별도로 실행되므로 이 파일에서는 제거됩니다.)

*   **`monitoring/loki-config.yml` 작성:**
    *   Loki의 기본 설정(포트, 스키마, 스토리지 등)을 정의합니다.
    *   로컬 테스트 환경에서의 권한 문제를 해결하기 위해 데이터 저장 경로를 `/tmp/loki`로 변경했습니다.

## 4. 로컬 테스트 가이드

수정된 AI 추론 서버와 모니터링 스택의 연동을 로컬 환경에서 테스트하는 방법입니다.

1.  **Docker Desktop 실행 확인:** Docker Desktop이 실행 중인지 확인합니다.

2.  **AI 서버 이미지 빌드:**
    ```bash
    docker build -t ai-server:local-test .
    ```

3.  **모니터링 스택 실행:**
    *   `monitoring/docker-compose.yml` 파일에 `ai-server` 서비스가 **포함된 상태**로 실행합니다.
    *   `monitoring` 디렉토리로 이동하여 다음 명령어를 실행합니다.
    ```bash
    docker-compose up -d
    ```
    *   (만약 `ai-server` 서비스가 `docker-compose.yml`에 포함되어 있지 않다면, 별도로 `docker run` 명령어를 사용하여 AI 서버 컨테이너를 실행해야 합니다. 이때 `--network monitoring_monitoring` 옵션과 `LOKI_URL` 환경 변수를 올바르게 설정해야 합니다.)

4.  **AI 서버 모델 로딩 대기:** AI 서버 컨테이너가 완전히 시작되고 모델을 로드할 때까지 충분히 기다립니다 (최소 1~2분).

5.  **테스트 요청 전송:**
    *   `payload.json` 파일을 현재 디렉토리(`deploy`)에 생성합니다. 내용: `{"file_name": "test/"}`
    *   다음 `curl` 명령어를 실행하여 AI 서버에 추론 요청을 보냅니다.
    ```bash
    curl -X POST http://localhost:8000/inference -H "Content-Type: application/json" --data @payload.json
    ```

6.  **Grafana에서 로그 확인:**
    *   웹 브라우저에서 `http://localhost:3000`으로 Grafana에 접속합니다 (기본 ID/PW: `admin`/`admin`).
    *   왼쪽 메뉴에서 **Configuration (톱니바퀴 아이콘) > Data sources > Add data source > Loki**를 선택합니다.
    *   Loki 설정에서 **URL**을 `http://loki:3100`으로 설정하고 `Save & test`를 클릭합니다.
    *   왼쪽 메뉴에서 **Explore (나침반 아이콘)**를 클릭합니다.
    *   데이터 소스를 `Loki`로 선택하고, 쿼리 필드에 `{job="ai-inference-server"}`를 입력한 후 `Run query`를 클릭합니다.
    *   AI 서버에서 전송된 커스텀 로그 데이터가 나타나는 것을 확인할 수 있습니다.

## 5. 향후 작업 및 배포

*   **Cloud Run 배포:** AI 추론 서버는 Docker 이미지를 빌드하여 Cloud Run에 배포합니다. 이때 `LOKI_URL` 환경 변수를 VM에 배포된 Loki 서버의 외부 IP 주소로 설정해야 합니다.
*   **VM 배포:** Loki와 Grafana는 VM에 Docker 또는 Docker Compose를 사용하여 배포합니다. VM의 방화벽 설정에서 Loki 포트(기본 3100)를 AI 서버가 접근할 수 있도록 열어주어야 합니다.
*   **로그 수집 확장:** 다른 Python 서버나 Java 서버의 로그를 Loki로 수집하려면, 해당 서버에 Promtail 에이전트를 설치하고 로그 파일을 Loki로 전송하도록 설정해야 합니다.

