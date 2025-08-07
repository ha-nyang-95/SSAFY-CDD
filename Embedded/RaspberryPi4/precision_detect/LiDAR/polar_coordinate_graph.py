import os
os.environ.setdefault('DISPLAY', 'localhost:0.0')

import matplotlib
matplotlib.use('Qt5Agg')
import matplotlib.pyplot as plt
import ydlidar
import time
import numpy as np
from sklearn.linear_model import RANSACRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# --- 사용자 설정값 ---
MAX_DISTANCE_M      = 1.0    # 최대 거리 필터 (m)
UPDATE_INTERVAL     = 0.1    # 갱신 간격 (초)
ANGLE_MIN_DEG       = 120   # 극좌표 최소 각도 (°)
ANGLE_MAX_DEG       = 240    # 극좌표 최대 각도 (°)

# --- RANSAC 설정 ---
RESIDUAL_THRESHOLD  = 0.01   # 1cm
MIN_SAMPLES_FOR_FIT = 10

def fit_and_detect_outliers(points, invert=False):
    """
    RANSAC으로 곡선 모델 피팅 및 이상치 탐지
    :param points: (N,2) array, [theta(rad), r]
    :param invert: True면 r -> -r 변환 후 탐지 (볼록)
    :return: (model, inlier_mask, outlier_mask)
    """
    pts = points.copy()
    if invert:
        pts[:,1] *= -1

    if len(pts) < MIN_SAMPLES_FOR_FIT:
        return None, None, None

    X = pts[:,0].reshape(-1,1)
    y = pts[:,1]

    pipeline = make_pipeline(
        PolynomialFeatures(degree=2),
        RANSACRegressor(
            residual_threshold=RESIDUAL_THRESHOLD,
            min_samples=3,
            max_trials=100,
            random_state=42
        )
    )
    pipeline.fit(X, y)
    ransac = pipeline.named_steps['ransacregressor']
    inlier_mask = ransac.inlier_mask_
    outlier_mask = ~inlier_mask
    return ransac, inlier_mask, outlier_mask

def run_visualization_with_outlier_detection():
    # LiDAR 초기화
    lidar = ydlidar.CYdLidar()
    lidar.setlidaropt(ydlidar.LidarPropSerialPort, "/dev/ttyUSB0")
    lidar.setlidaropt(ydlidar.LidarPropSerialBaudrate, 128000)
    lidar.setlidaropt(ydlidar.LidarPropLidarType, ydlidar.TYPE_TRIANGLE)
    lidar.setlidaropt(ydlidar.LidarPropDeviceType, ydlidar.YDLIDAR_TYPE_SERIAL)
    lidar.setlidaropt(ydlidar.LidarPropSampleRate, 5)
    lidar.setlidaropt(ydlidar.LidarPropScanFrequency, 10.0)
    lidar.setlidaropt(ydlidar.LidarPropSingleChannel, True)
    lidar.setlidaropt(ydlidar.LidarPropAutoReconnect, True)
    lidar.setlidaropt(ydlidar.LidarPropSupportMotorDtrCtrl, False)


    if not lidar.initialize() or not lidar.turnOn():
        print("LiDAR 초기화/시작 실패")
        return

    scan = ydlidar.LaserScan()
    plt.ion()
    fig, ax = plt.subplots(figsize=(8,8), subplot_kw={'projection':'polar'})
    ax.set_thetamin(ANGLE_MIN_DEG)
    ax.set_thetamax(ANGLE_MAX_DEG)
    ax.set_ylim(0, MAX_DISTANCE_M)
    last_update = time.time()

    print("이상치 탐지 모드 시작. Ctrl+C로 중단")

    try:
        while lidar.doProcessSimple(scan):
            if not scan.points:
                continue

            # 1) 각도·거리 필터링 → (theta, r) 수집
            data = []
            for p in scan.points:
                r = p.range
                if r <= 0 or r > MAX_DISTANCE_M:
                    continue
                theta = p.angle
                deg = np.degrees(theta)
                if deg < 0:
                    deg += 360
                if ANGLE_MIN_DEG <= deg <= ANGLE_MAX_DEG:
                    data.append([theta, r])
            pts = np.array(data)
            if len(pts) < MIN_SAMPLES_FOR_FIT:
                continue

            # 2) 볼록 → 오목 순으로 RANSAC 실행
            m_convex, in_convex, out_convex = fit_and_detect_outliers(pts, invert=True)
            m_concave, in_concave, out_concave = fit_and_detect_outliers(pts, invert=False)

            n_convex = in_convex.sum() if in_convex is not None else 0
            n_concave = in_concave.sum() if in_concave is not None else 0

            # 3) 인라이어가 더 많은 모델 선택
            if n_convex > n_concave:
                model, in_mask, out_mask, is_convex = m_convex, in_convex, out_convex, True
            else:
                model, in_mask, out_mask, is_convex = m_concave, in_concave, out_concave, False

            # 4) 주기적 갱신
            if time.time() - last_update < UPDATE_INTERVAL:
                continue
            last_update = time.time()

            # 5) 플롯
            ax.clear()
            ax.set_thetamin(ANGLE_MIN_DEG); ax.set_thetamax(ANGLE_MAX_DEG)
            ax.set_ylim(0, MAX_DISTANCE_M)

            r_vals = pts[:,1] * (-1 if is_convex else 1)
            ax.scatter(pts[in_mask,0], r_vals[in_mask], s=10, label='Inliers')
            if out_mask.any():
                ax.scatter(pts[out_mask,0], r_vals[out_mask],
                           s=50, color='red', label='Outliers')
                print(f"🚨 이상치: {pts[out_mask].tolist()}")

            # 추세선 계산 및 그리기
            deg_line = np.linspace(ANGLE_MIN_DEG, ANGLE_MAX_DEG, 200)
            th_line = np.deg2rad(deg_line)
            tf = PolynomialFeatures(degree=2).fit_transform(th_line.reshape(-1,1))
            r_line = model.predict(tf)
            if is_convex:
                r_line = -r_line
            ax.plot(th_line, r_line, linewidth=2, label='Detected Curve')

            ax.set_title(f"LiDAR Outlier Detection (Threshold: {RESIDUAL_THRESHOLD*100:.1f} cm)")
            ax.legend(loc='upper right')
            ax.grid(True)

            fig.canvas.draw()
            plt.pause(0.001)

    except KeyboardInterrupt:
        pass
    finally:
        lidar.turnOff()
        lidar.disconnecting()
        plt.ioff()
        plt.show()

if __name__ == '__main__':
    run_visualization_with_outlier_detection()
