import paho.mqtt.client as mqtt
import time
import json
import os
from lidar_scanner import run_lidar_crack_detection

# =================================================================================
JETSON_IP = "192.168.4.1"
COMMAND_TOPIC = "cdd/command/detect"
DATA_TOPIC = "cdd/data/sensor_value"
# =================================================================================

def get_sensor_data():
    print("[INFO] 정밀 탐지 명령 수신. LiDAR 측정을 시작합니다...")
    lidar_results = run_lidar_crack_detection()
    print(f"[INFO] LiDAR 측정 완료. 결과: {lidar_results}")
    return lidar_results

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[INFO] MQTT 브로커({JETSON_IP})에 성공적으로 연결되었습니다.")
        client.subscribe(COMMAND_TOPIC)
    else:
        print(f"[INFO] MQTT 연결 실패, 코드: {rc}")


def on_message(client, userdata, msg):
    command = msg.payload.decode()
    print(f"[INFO] 젯슨으로부터 명령 수신: {command}")
    
    if command == "START":
        result_data = get_sensor_data()
        client.publish(DATA_TOPIC, json.dumps(result_data))
        print("[INFO] 측정 결과를 젯슨으로 전송했습니다.")

if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    print("[INFO] 젯슨의 MQTT 브로커에 연결을 시도합니다...")
    
    while True:
        try:
            client.connect(JETSON_IP, 1883, 60)
            client.loop_forever() 
        except Exception as e:
            print(f"[ERROR] MQTT 브로커에 연결할 수 없습니다: {e}. 5초 후 재시도합니다.")
            time.sleep(5)