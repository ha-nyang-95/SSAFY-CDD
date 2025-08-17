import os
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import json
import time
import logging

LOKI_URL = os.getenv("LOKI_URL", "http://loki:3100/loki/api/v1/push")

def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def send_log_to_loki(log_data: dict, job_name: str = "ai-inference-server"):
    """
    주어진 데이터를 Loki로 전송합니다. 연결 실패 시 재시도합니다.
    
    :param log_data: Loki로 전송할 로그 데이터 (dict)
    :param job_name: Loki에서 사용할 job 라벨 (str)
    """
    if not LOKI_URL:
        logging.warning("LOKI_URL is not set. Skipping log push.")
        return

    payload = {
        "streams": [
            {
                "stream": {
                    "job": job_name,
                    "source": "cloud_run"
                },
                "values": [
                    [str(time.time_ns()), json.dumps(log_data)]
                ]
            }
        ]
    }

    try:
        session = requests_retry_session()
        response = session.post(LOKI_URL, json=payload, headers={'Content-type': 'application/json'})
        response.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to send log to Loki after retries: {e}")
