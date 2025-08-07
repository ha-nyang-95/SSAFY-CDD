import paho.mqtt.client as mqtt
import time
import json
import base64
import os 

# =================================================================================
JETSON_IP = "192.168.4.1"
LOCAL_RTSP_URL = "rtsp://127.0.0.1:8554/unicast"
COMMAND_TOPIC = "cdd/command/detect"
DATA_TOPIC = "cdd/data/sensor_value"
# =================================================================================

def get_sensor_data():
    """ffmpeg으로 RTSP 스냅샷 촬영, 센서 값 측정 후 결과 반환"""
    print("[INFO] 정밀 탐지 프로세스를 시작합니다...")
    
    # RTSP 스트림에서 스냅샷 촬영 
    image_base64_string = ""
    temp_image_path = "/tmp/capture.jpg" # 이미지를 저장할 임시 경로
    
    try:

        command = f"ffmpeg -i {LOCAL_RTSP_URL} -vframes 1 -q:v 2 -y {temp_image_path}"
        print(f"[CMD] 실행 명령어: {command}")
        
        result_code = os.system(command)
        if result_code != 0:
            raise RuntimeError(f"ffmpeg 명령어 실행 실패, 종료 코드: {result_code}")

        # 저장된 이미지 파일을 읽어서 Base64로 인코딩
        with open(temp_image_path, "rb") as image_file:
            image_bytes = image_file.read()
            image_base64_string = base64.b64encode(image_bytes).decode('utf-8')
        
        print("[INFO] ffmpeg RTSP 스냅샷 촬영 및 인코딩 완료.")

    except Exception as e:
        print(f"[ERROR] 사진 촬영 중 오류 발생: {e}")
    finally:
        # 작업 후 임시 이미지 파일 삭제
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)

    # 기타 센서 값 측정 
    print("[INFO] 라이더 센서 값 측정 중...")
    is_crack = True
    wall_dist = 25.4 + (time.time() % 5)
    max_depth = 5.2 + (time.time() % 2)
    
    #모든 데이터를 딕셔너리로 묶어서 반환 
    return {
        "image": image_base64_string,
        "crack_detected": is_crack,
        "distance_wall": wall_dist,
        "depth_max": max_depth
    }

# MQTT 콜백 함수 및 메인 실행 로직 
def on_connect(client, userdata, flags, rc):
    print(f"[INFO] MQTT 브로커({JETSON_IP})에 성공적으로 연결되었습니다.")
    client.subscribe(COMMAND_TOPIC)

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
    try:
        client.connect(JETSON_IP, 1883, 60)
        client.loop_forever()
    except Exception as e:
        print(f"[ERROR] MQTT 브로커에 연결할 수 없습니다: {e}")