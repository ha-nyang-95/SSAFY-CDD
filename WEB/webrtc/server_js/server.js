// server.js

// 'ws' 라이브러리를 가져옵니다.
import { WebSocketServer } from 'ws';

// 8080 포트에 WebSocket 서버를 생성합니다.
const wss = new WebSocketServer({ port: 8080 });

// 연결된 모든 클라이언트(드론, 웹 브라우저)를 저장할 Set을 만듭니다.
const clients = new Set();

// 클라이언트가 서버에 연결되었을 때 실행될 코드를 정의합니다.
wss.on('connection', (ws) => {
    console.log('클라이언트가 연결되었습니다.');
    clients.add(ws); // 새로 연결된 클라이언트를 Set에 추가

    // 클라이언트로부터 메시지를 받았을 때 실행될 코드를 정의합니다.
    ws.on('message', (message) => {
        console.log('받은 메시지:', message.toString());
        
        // 메시지를 보낸 클라이언트를 제외한 모든 클라이언트에게 메시지를 전달합니다.
        for (const client of clients) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(message.toString());
            }
        }
    });

    // 클라이언트 연결이 끊겼을 때 실행될 코드를 정의합니다.
    ws.on('close', () => {
        console.log('클라이언트 연결이 끊겼습니다.');
        clients.delete(ws); // 연결이 끊긴 클라이언트를 Set에서 제거
    });

    // 에러 처리
    ws.on('error', (error) => {
        console.error('WebSocket 에러 발생:', error);
    });
});

console.log('시그널링 서버가 8080 포트에서 실행 중입니다...');