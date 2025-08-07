import paho.mqtt.client as mqtt
import time
import json
import base64
import cv2  # OpenCV 라이브러리
# import your_lidar_library  #  실제 사용하는 라이더 센서 라이브러리로 교체

# =================================================================================
# 젯슨 나노가 로컬 AP로 동작할 때의 IP 주소 
JETSON_IP = "192.168.4.1" 

# 라즈베리파이 자기 자신의 RTSP 스트림 주소
# v4l2rtspserver가 만드는 스트림에 접속하여 스냅샷 찍는 방식
LOCAL_RTSP_URL = "rtsp://127.0.0.1:8554/unicast"

# MQTT 토픽 이름 (젯슨의 app.py와 동일하게 설정)
COMMAND_TOPIC = "cdd/command/detect" # 젯슨에서 정밀탐지 버튼 신호에 대한 토픽
DATA_TOPIC = "cdd/data/sensor_value" # 센서값에 대한 토픽
# =================================================================================

def get_sensor_data():
    """RTSP 스냅샷 촬영, 센서 값 측정을 처리하고 결과를 딕셔너리로 반환하는 함수"""
    print("[INFO] 정밀 탐지 프로세스를 시작합니다...")
    
    # --- 1. RTSP 스트림에서 스냅샷 촬영 및 Base64 인코딩 ---
    image_base64_string = None
    try:
        # 내 컴퓨터에서 실행 중인 RTSP 스트림에 접속
        cap = cv2.VideoCapture(LOCAL_RTSP_URL, cv2.CAP_GSTREAMER)
        if not cap.isOpened():
            raise RuntimeError("로컬 RTSP 스트림에 연결할 수 없습니다. v4l2rtspserver가 실행 중인지 확인하세요.")
        
        # 스트림에서 프레임 한 장만 읽어옴
        success, frame = cap.read()
        cap.release() # 즉시 연결 해제
        
        if not success:
            raise RuntimeError("RTSP 스트림에서 프레임을 읽어오는 데 실패했습니다.")

        # 읽어온 프레임을 JPEG 형식으로 인코딩
        success, buffer = cv2.imencode('.jpg', frame)
        if not success:
            raise RuntimeError("프레임을 JPEG로 인코딩하는 데 실패했습니다.")
        
        # 인코딩된 데이터를 Base64 문자열로 변환
        image_base64_string = base64.b64encode(buffer).decode('utf-8')
        print("[INFO] RTSP 스냅샷 촬영 및 인코딩 완료.")

    except Exception as e:
        print(f"[ERROR] 사진 촬영 중 오류 발생: {e}")
        image_base64_string = ""

    # --- 2. 기타 센서 값 측정 (이전과 동일) ---
    print("[INFO] 라이더 센서 값 측정 중...")
    # TODO: 이 부분은 실제 라이더 센서 코드
    is_crack = True
    wall_dist = 25.4 + (time.time() % 5)
    max_depth = 5.2 + (time.time() % 2)
    print(f"[INFO] 측정 완료 - 균열: {is_crack}, 거리: {wall_dist:.2f}, 깊이: {max_depth:.2f}")
    
    # --- 3. 모든 데이터를 딕셔너리로 묶어서 반환 ---
    return {
        "image": image_base64_string,
        "crack_detected": is_crack,
        "distance_wall": wall_dist,
        "depth_max": max_depth
    }

# --- MQTT 콜백 함수 및 메인 실행 로직 (수정 없음) ---
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
        print("라즈베리파이가 젯슨의 AP에 올바르게 연결되었는지, 젯슨의 IP 주소가 맞는지 확인해주세요.")