import os
import time
import numpy as np
import matplotlib
matplotlib.use('Qt5Agg')
import matplotlib.pyplot as plt
import ydlidar
from sklearn.linear_model import RANSACRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# --- 사용자 설정값 ---
MAX_DISTANCE_M      = 1.0    # 최대 거리 필터 (m)
ANGLE_MIN_DEG       = 120    # 극좌표 최소 각도 (°)
ANGLE_MAX_DEG       = 240    # 극좌표 최대 각도 (°)
RESIDUAL_THRESHOLD  = 0.01   # RANSAC 잔차 임계치 (m)
MIN_SAMPLES_FOR_FIT = 10     # 최소 샘플 수
OUTLIER_THRESHOLD   = 5      # 진짜 이상치로 판단할 최소 탐지 횟수

def fit_and_detect_outliers(points, invert=False):
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
    in_mask = pipeline.named_steps['ransacregressor'].inlier_mask_
    out_mask = ~in_mask
    return pipeline, in_mask, out_mask

def scan_for_outliers(duration_sec):
    lidar = ydlidar.CYdLidar()
    lidar.setlidaropt(ydlidar.LidarPropSerialPort, "/dev/ttyUSB0")
    lidar.setlidaropt(ydlidar.LidarPropSerialBaudrate, 128000)
    lidar.setlidaropt(ydlidar.LidarPropLidarType, ydlidar.TYPE_TRIANGLE)
    lidar.setlidaropt(ydlidar.LidarPropDeviceType, ydlidar.YDLIDAR_TYPE_SERIAL)
    lidar.setlidaropt(ydlidar.LidarPropSampleRate, 5)
    lidar.setlidaropt(ydlidar.LidarPropScanFrequency, 10.0)
    lidar.setlidaropt(ydlidar.LidarPropSingleChannel, True)
    lidar.setlidaropt(ydlidar.LidarPropAutoReconnect, True)

    if not lidar.initialize() or not lidar.turnOn():
        print("LiDAR 초기화/시작 실패")
        return

    scan = ydlidar.LaserScan()
    start_time = time.time()
    outlier_info = {}  # {(deg, r): {'count':int, 'distances':[...]}}
    print(f"{duration_sec}초 동안 스캔을 시작합니다...")

    try:
        while time.time() - start_time < duration_sec and lidar.doProcessSimple(scan):
            pts_list = []
            for p in scan.points:
                r = p.range
                if r <= 0 or r > MAX_DISTANCE_M:
                    continue
                theta = p.angle
                deg = np.degrees(theta) % 360
                if ANGLE_MIN_DEG <= deg <= ANGLE_MAX_DEG:
                    pts_list.append([theta, r])
            pts = np.array(pts_list)
            if len(pts) < MIN_SAMPLES_FOR_FIT:
                continue

            # 볼록/오목 모델 피팅
            pipe_conv, in_conv, out_conv = fit_and_detect_outliers(pts, invert=True)
            pipe_conc, in_conc, out_conc = fit_and_detect_outliers(pts, invert=False)
            n_conv = in_conv.sum() if in_conv is not None else 0
            n_conc = in_conc.sum() if in_conc is not None else 0

            # 최종 모델 선택
            if n_conv > n_conc:
                pipeline, out_mask, is_convex = pipe_conv, out_conv, True
            else:
                pipeline, out_mask, is_convex = pipe_conc, out_conc, False

            # 이상치 집계 및 거리 계산
            for idx, flag in enumerate(out_mask):
                if not flag:
                    continue
                theta, r_actual = pts[idx]
                deg = round((np.degrees(theta) % 360), 1)
                r_round = round(r_actual, 3)
                key = (deg, r_round)

                # 추세선 예측값 및 거리
                r_pred = pipeline.predict(np.array([[theta]]))[0]
                if is_convex:
                    r_pred = -r_pred
                distance = abs(r_actual - r_pred)

                info = outlier_info.setdefault(key, {'count':0, 'distances':[]})
                info['count'] += 1
                info['distances'].append(distance)

        # 진짜 이상치 중 최대 거리 하나만 선택
        real = {k:v for k,v in outlier_info.items() if v['count'] >= OUTLIER_THRESHOLD}
        if real:
            # 최대 거리 기준으로 하나만 추출
            (deg, r_round), info = max(
                real.items(),
                key=lambda item: max(item[1]['distances'])
            )
            cnt = info['count']
            max_d = max(info['distances'])
            print("🚨 가장 심각한 이상치:")
            print(f"  - 각도 {deg}°, 거리 {r_round}m: {cnt}회 탐지, 최대 편차 {max_d:.4f}cm")
        else:
            print("진짜 이상치가 없습니다.")
    except KeyboardInterrupt:
        print("스캔이 중단되었습니다.")
    finally:
        lidar.turnOff()
        lidar.disconnecting()

if __name__ == '__main__':
    scan_for_outliers(10)
