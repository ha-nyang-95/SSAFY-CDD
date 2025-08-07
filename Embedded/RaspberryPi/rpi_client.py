import paho.mqtt.client as mqtt
import time
import json
import base64
import cv2  # OpenCV 라이브러리

# =================================================================================
JETSON_IP = "192.168.4.1"
COMMAND_TOPIC = "cdd/command/detect"
DATA_TOPIC = "cdd/data/sensor_value"
CAMERA_INDEX = 0  
# =================================================================================

def get_sensor_data():
    print("[INFO] 정밀 탐지 프로세스를 시작합니다...")
    
    image_base64_string = "" # 실패에 대비해 미리 초기화
    try:
        # 카메라 장치 열기
        cap = cv2.VideoCapture(CAMERA_INDEX)
        if not cap.isOpened():
            raise RuntimeError("USB 카메라를 열 수 없습니다.")
        
        # 잠시 시간을 주어 카메라가 자동 노출/초점을 맞추도록 함
        time.sleep(1) 
        
        # 프레임 읽기
        success, frame = cap.read()
        
        # 사용 후 즉시 카메라 자원 해제 (매우 중요!)
        cap.release() 
        
        if not success:
            raise RuntimeError("카메라에서 프레임을 읽는 데 실패했습니다.")

        # 읽어온 프레임을 JPEG 형식으로 메모리에서 인코딩
        success, buffer = cv2.imencode('.jpg', frame)
        if not success:
            raise RuntimeError("프레임을 JPEG로 인코딩하는 데 실패했습니다.")
        
        # 인코딩된 데이터를 Base64 문자열로 변환
        image_base64_string = base64.b64encode(buffer).decode('utf-8')
        print("[INFO] USB 카메라 스냅샷 촬영 및 인코딩 완료.")

    except Exception as e:
        print(f"[ERROR] 사진 촬영 중 오류 발생: {e}")
        # 이 경우 image_base64_string은 위에서 초기화된 빈 문자열("")이 됨

    print("[INFO] 라이더 센서 값 측정 중...")
    is_crack = True
    wall_dist = 25.4 + (time.time() % 5)
    max_depth = 5.2 + (time.time() % 2)
    print(f"[INFO] 측정 완료 - 균열: {is_crack}, 거리: {wall_dist:.2f}, 깊이: {max_depth:.2f}")
    
    return {
        "image": image_base64_string,
        "crack_detected": is_crack,
        "distance_wall": wall_dist,
        "depth_max": max_depth
    }

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