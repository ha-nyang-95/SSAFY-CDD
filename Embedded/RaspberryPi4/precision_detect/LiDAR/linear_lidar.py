import os
os.environ.setdefault('DISPLAY', 'localhost:0')

import matplotlib
matplotlib.use('Qt5Agg')
import matplotlib.pyplot as plt
import ydlidar
import time
import math
import numpy as np
from sklearn.linear_model import LinearRegression

# --- 사용자 설정값 ---
MAX_DISTANCE_M      = 1.0    # 최대 거리 필터 (m)
UPDATE_INTERVAL     = 0.1    # 갱신 간격 (초)
ANGLE_MIN_DEG       = 135    # 필터 최소 각도 (°)
ANGLE_MAX_DEG       = 225    # 필터 최대 각도 (°)
MIN_SAMPLES_FOR_FIT = 10     # 최소 샘플 수

def run_dynamic_outlier_detection():
    lidar = ydlidar.CYdLidar()
    # LiDAR 기본 설정
    lidar.setlidaropt(ydlidar.LidarPropSerialPort,    "/dev/ttyUSB0")
    lidar.setlidaropt(ydlidar.LidarPropSerialBaudrate, 128000)
    lidar.setlidaropt(ydlidar.LidarPropLidarType,     ydlidar.TYPE_TRIANGLE)
    lidar.setlidaropt(ydlidar.LidarPropDeviceType,    ydlidar.YDLIDAR_TYPE_SERIAL)
    lidar.setlidaropt(ydlidar.LidarPropSampleRate,    5)
    lidar.setlidaropt(ydlidar.LidarPropScanFrequency, 10.0)
    lidar.setlidaropt(ydlidar.LidarPropSingleChannel, True)
    lidar.setlidaropt(ydlidar.LidarPropAutoReconnect, True)
    lidar.setlidaropt(ydlidar.LidarPropSupportMotorDtrCtrl, False)


    if not lidar.initialize() or not lidar.turnOn():
        print("LiDAR 초기화 또는 스캔 실패")
        return

    scan = ydlidar.LaserScan()
    plt.ion()
    fig, ax = plt.subplots(subplot_kw={'projection':'polar'}, figsize=(6,6))
    ax.set_thetamin(ANGLE_MIN_DEG)
    ax.set_thetamax(ANGLE_MAX_DEG)
    ax.set_ylim(0, MAX_DISTANCE_M)

    print("Dynamic Outlier Detection 시작 (Ctrl+C 종료)")
    last_update = time.time()

    try:
        while lidar.doProcessSimple(scan):
            if not scan.points:
                continue

            # 1) 각도·거리 필터링
            data = []
            for p in scan.points:
                r = p.range
                if r <= 0 or r > MAX_DISTANCE_M:
                    continue
                deg = math.degrees(-p.angle) % 360
                if ANGLE_MIN_DEG <= deg <= ANGLE_MAX_DEG:
                    data.append((math.radians(deg), r))

            pts = np.array(data)
            if len(pts) < MIN_SAMPLES_FOR_FIT:
                continue

            # 2) Cartesian 변환 & Linear Regression
            thetas = pts[:,0]
            dists  = pts[:,1]
            xs = dists * np.cos(thetas)
            ys = dists * np.sin(thetas)

            lr = LinearRegression()
            lr.fit(xs.reshape(-1,1), ys)
            preds     = lr.predict(xs.reshape(-1,1))
            residuals = np.abs(ys - preds)

            # 3) 잔차 분포(평균) 계산 & 이상치 판정
            mean_res = residuals.mean()
            is_outlier = residuals > mean_res 

            # 4) plotting 주기 제어
            now = time.time()
            if now - last_update < UPDATE_INTERVAL:
                continue
            last_update = now

            ax.clear()
            ax.set_thetamin(ANGLE_MIN_DEG)
            ax.set_thetamax(ANGLE_MAX_DEG)
            ax.set_ylim(0, MAX_DISTANCE_M)

            # 정상점 표시
            inliers = ~is_outlier
            ax.scatter(thetas[inliers], dists[inliers], s=10, label='Inliers')

            # 이상치 표시
            if is_outlier.any():
                ax.scatter(thetas[is_outlier], dists[is_outlier],
                           s=30, color='red', label='Outliers')
                print("이상치 (θ, r):", list(zip(thetas[is_outlier], dists[is_outlier])))

            # 회귀선 (Cartesian → Polar)
            x_line = np.linspace(xs.min(), xs.max(), 200)
            y_line = lr.predict(x_line.reshape(-1,1))
            theta_line = np.arctan2(y_line, x_line)
            r_line     = np.hypot(x_line, y_line)
            ax.plot(theta_line, r_line, linewidth=2, label='Regression Line')

            ax.set_title(f"Outlier Detection (Mean Residual = {mean_res:.3f} m)")
            ax.legend(loc='upper right')
            ax.grid(True)

            fig.canvas.draw()
            plt.pause(0.001)

    except KeyboardInterrupt:
        pass
    finally:
        print("LiDAR 정지 및 연결 해제")
        lidar.turnOff()
        lidar.disconnecting()
        plt.ioff()
        plt.show()

if __name__ == '__main__':
    run_dynamic_outlier_detection()
