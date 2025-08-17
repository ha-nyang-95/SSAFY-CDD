import logging
import traceback
import json

class JsonFormatter(logging.Formatter):
    """
    logging.Formatter를 상속받아 로그 레코드를 JSON 형식으로 변환하는 클래스.
    향후 다른 모니터링 시스템과의 연동을 위해 표준 라이브러리만으로 구현.
    """
    def format(self, record: logging.LogRecord) -> str:
        # 기본적으로 포함될 로그 정보 (타임스탬프, 로그 수준, 메시지)
        log_object = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
        }

        # logging 호출 시 'extra' 파라미터로 전달된 커스텀 데이터를 'details' 키로 추가
        if hasattr(record, 'details'):
            log_object['details'] = record.details

        # 예외 정보가 있는 경우, 스택 트레이스를 'exception' 키로 추가
        if record.exc_info:
            log_object['exception'] = "".join(traceback.format_exception(record.exc_info[0], record.exc_info[1], record.exc_info[2]))

        return json.dumps(log_object, ensure_ascii=False)