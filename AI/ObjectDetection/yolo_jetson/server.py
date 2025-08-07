import asyncio
import websockets
import json
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)

# 연결된 클라이언트를 저장할 딕셔너리
# 'drone'과 'viewer' 역할을 구분하여 저장
clients = {
    "drone": None,
    "viewer": None
}

async def handler(websocket):
    """
    WebSocket 연결을 처리하고 메시지를 중계하는 핸들러
    """
    global clients
    client_role = None  # 현재 클라이언트의 역할을 저장할 변수

    try:
        # 최초 연결 시 역할(role)을 받음
        message = await websocket.recv()
        data = json.loads(message)
        
        if data.get('type') == 'register':
            role = data.get('role')
            
            # 기존 연결이 있으면 정리하고 새 연결 허용
            if role in clients and clients[role] is not None:
                try:
                    await clients[role].close()
                    logging.info(f"Closed previous {role} connection")
                except:
                    pass  # 이미 닫힌 연결이면 무시
            
            clients[role] = websocket
            client_role = role
            logging.info(f"{client_role} connected: {websocket.remote_address}")
            await websocket.send(json.dumps({"type": "registered", "role": client_role}))

            # 두 클라이언트가 모두 연결되면 서로에게 알림
            if clients["drone"] and clients["viewer"]:
                logging.info("Drone and Viewer are both connected. Notifying viewer to start.")
                try:
                    await clients["viewer"].send(json.dumps({"type": "drone_ready"}))
                except:
                    logging.warning("Failed to notify viewer")

        else:
            logging.warning("First message was not for registration. Closing connection.")
            return

        # 메시지 중계 루프
        while True:
            message = await websocket.recv()
            logging.info(f"Message from {client_role}: {message[:100]}...") # 메시지가 너무 길 경우 일부만 로깅
            
            # 상대방에게 메시지 전달
            if client_role == "drone" and clients["viewer"]:
                try:
                    await clients["viewer"].send(message)
                    logging.debug(f"Forwarded message from drone to viewer")
                except websockets.exceptions.ConnectionClosed:
                    logging.warning("Viewer connection closed while sending message")
                    clients["viewer"] = None
                except Exception as e:
                    logging.error(f"Error forwarding to viewer: {e}")
                    clients["viewer"] = None
            elif client_role == "viewer" and clients["drone"]:
                try:
                    await clients["drone"].send(message)
                    logging.debug(f"Forwarded message from viewer to drone")
                except websockets.exceptions.ConnectionClosed:
                    logging.warning("Drone connection closed while sending message")
                    clients["drone"] = None
                except Exception as e:
                    logging.error(f"Error forwarding to drone: {e}")
                    clients["drone"] = None
            else:
                logging.warning(f"No target client for {client_role} message")

    except websockets.exceptions.ConnectionClosed as e:
        logging.info(f"{client_role} disconnected: {e}")
    except json.JSONDecodeError as e:
        logging.error(f"Invalid JSON from {client_role}: {e}")
    except Exception as e:
        logging.error(f"An error occurred with {client_role}: {e}")
    finally:
        # 연결 종료 시 클라이언트 목록에서 제거
        if client_role and clients.get(client_role) == websocket:
            clients[client_role] = None
            logging.info(f"{client_role} removed from clients list.")


async def main():
    # IPv4의 모든 주소에서 8765 포트로 WebSocket 서버 실행
    async with websockets.serve(handler, "0.0.0.0", 8765):
        logging.info("Signaling server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # 서버를 계속 실행

if __name__ == "__main__":
    asyncio.run(main())