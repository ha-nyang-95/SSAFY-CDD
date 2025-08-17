

## LiDAR

**outbound_detect.py**
- 지정한 각도와 지정한 거리의 물체를 탐지
- 점들을 통해 추세선을 예측
- 추세선과 동떨어진 값을 이상값으로 처리
- 10초 동안 동일한 위치에 이상값이 인식되면 진짜 이상값으로 처리
- 진짜 이상값 중 추세선과 가장 멀리 떨어진 값을 최대 이상값으로 처리


**polar_coordinate_graph.py**
- 극 좌표계에서 지정한 각도와 지정한 거리의 물체를 탐지
- 점들을 통해 추세선을 좌표계에 그림
- 추세선에서 벗어난 값은 이상값으로 처리하여 붉은 색으로 표시


## 원하는 값
1. 트리거가 실행 명령
2. 10초간 LiDAR 실행
3. 값들을 통해 균열 여부, 균열 깊이

## ydlidar 라이브러리 세팅
Windows에서 세팅하는 법!!!!

.

.

.

.

.

.

.

그런 건 없다. WSL 쓰자.


## USB 포트 연결

1. WSL 20.04 설치 및 등록
2. VSCode에서 연결
3. Powershell 관리자 모드로 열기
4. win-usbipd 설치^[https://github.com/dorssel/usbipd-win]
	```
	winget install usbipd
	```
5. 설치가 완료되면 Powershell 관리자 모드로 새로 창 열고 기존 창은 닫기
6. usb 포트 확인하기
	```
	usbipd list
	```
7. 연결할 포트 번호 확인해서 공유로 변경
	```
	usbipd bind --busid 3-2
	```
8. 공유가 가능한 포트 wsl에 연결
	```
	usbipd attach --wsl --busid 3-2
	```
9. 다시 WSL로 돌아가서 확인해보기
	```
	lsusb
	```



## Cmake 세팅
```
sudo apt update && sudo apt upgrade -y
sudo apt install git cmake g++ build--essential swig
```

## Python 세팅
```
sudo apt install python3-pip
```



## YDLidar 설치
```
cd ~
git clone https://github.com/YDLIDAR/YDLidar-SDK.git

cd ~/YDLidar-SDK
mkdir build

cd build
cmake ..
make
sudo make install

cd ~/YDLidar-SDK
sudo python3 setup.py install
```


## YDLiDAR X4-Pro 연결하는 법!!!
Table에 X4-Pro는 존재하지 않음.

X4와 동일하게 세팅하고 모터를 false로 바꾸면 동작함!

```
lidar = ydlidar.CYdLidar()
lidar.setlidaropt(ydlidar.LidarPropSerialPort, "/dev/ttyUSB0")
lidar.setlidaropt(ydlidar.LidarPropSerialBaudrate, 128000)
lidar.setlidaropt(ydlidar.LidarPropLidarType, ydlidar.TYPE_TRIANGLE)
lidar.setlidaropt(ydlidar.LidarPropDeviceType, ydlidar.YDLIDAR_TYPE_SERIAL)
lidar.setlidaropt(ydlidar.LidarPropSampleRate, 5)
lidar.setlidaropt(ydlidar.LidarPropScanFrequency, 10.0)
lidar.setlidaropt(ydlidar.LidarPropSingleChannel, True)
lidar.setlidaropt(ydlidar.LidarPropAutoReconnect, True)
lidar.setlidaropt(ydlidar.LidarPropSupportMotorDtrCtrl, False) ## 얘가 필수!!!
```

