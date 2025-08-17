import logging
from jsonformatter import JsonFormatter

def setup_json_logger():
    """
    애플리케이션의 전역 로거를 JSON 형식으로 설정합니다.
    이 함수는 애플리케이션 시작 시 한 번만 호출
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    if logger.hasHandlers():
        logger.handlers.clear()
    
    handler = logging.StreamHandler()
    formatter = JsonFormatter()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
