import paho.mqtt.client as mqtt
import json
import cv2
import threading
import logging
from config import MQTT_BROKER_HOST, MQTT_PORT

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class MqttController:
    def __init__(self, s3_handler):
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        
        self.s3_handler = s3_handler
        self.get_s3_auth_key_func = None # app.py에서 함수를 주입받을 예정

        self.latest_sensor_data = None
        self.frame_to_upload = None
        self.crack_counter = 0

        self.lidar_data_lock = threading.Lock()
        self.crack_counter_lock = threading.Lock()

    def _on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            logging.info("[MQTT] 브로커에 성공적으로 연결되었습니다.")
            client.subscribe("cdd/data/sensor_value")
        else:
            logging.error(f"[MQTT] 연결 실패. 코드: {rc}")

    def _on_message(self, client, userdata, msg):
        if self.frame_to_upload is None:
            return

        try:
            rpi_data = json.loads(msg.payload.decode())
            s3_auth_key = self.get_s3_auth_key_func()
            if not s3_auth_key:
                logging.warning("[MQTT] S3 인증 키가 없어 데이터 처리를 건너뜁니다.")
                return

            with self.crack_counter_lock:
                self.crack_counter += 1
                crack_id = f"crack_{self.crack_counter:03d}"
            
            s3_json_data = {**rpi_data, 'crack_id': crack_id}
            
            with self.lidar_data_lock:
                self.latest_sensor_data = {
                    "crack_id": crack_id,
                    "crack_detected": rpi_data.get("crack_detected", False),
                    "suspicion_points": rpi_data.get("suspicion_points", 0),
                    "depth_max": rpi_data.get("depth_max", 0.0)
                }
            
            image_s3_key = f"{s3_auth_key}/crack_num/{crack_id}/image.jpeg"
            json_s3_key = f"{s3_auth_key}/crack_num/{crack_id}/lidar.json"

            _, img_buffer = cv2.imencode('.jpg', self.frame_to_upload)
            threading.Thread(target=self.s3_handler.upload_bytes, args=(img_buffer.tobytes(), image_s3_key, 'image/jpeg'), daemon=True).start()

            json_bytes = json.dumps(s3_json_data, indent=4).encode('utf-8')
            threading.Thread(target=self.s3_handler.upload_bytes, args=(json_bytes, json_s3_key, 'application/json'), daemon=True).start()

        except Exception as e:
            logging.error(f"[MQTT] 데이터 처리 및 S3 업로드 중 오류 발생: {e}")
        finally:
            self.frame_to_upload = None

    def publish_command(self, topic, command):
        try:
            # 매번 새로운 클라이언트를 생성하여 publish하고 끊는 방식
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
            client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
            client.publish(topic, command)
            client.disconnect()
            logging.info(f"[MQTT] '{topic}'에 메시지 '{command}' 발행 성공.")
            return True
        except Exception as e:
            logging.error(f"[MQTT] 메시지 발행 실패: {e}")
            return False

    def run(self):
        try:
            self.client.connect(MQTT_BROKER_HOST, MQTT_PORT, 60)
            self.client.loop_forever()
        except Exception as e:
            logging.error(f"[MQTT] 클라이언트 실행 중 오류 발생: {e}")