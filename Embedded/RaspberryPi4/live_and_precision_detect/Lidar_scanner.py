import ydlidar
import time
import math
import numpy as np

# ---------------- 사용자 설정값 ----------------
MAX_DISTANCE_M        = 3.0
ANGLE_MIN_DEG         = 135
ANGLE_MAX_DEG         = 225
MIN_SAMPLES_FOR_FIT   = 20

# 분류 임계값 (미터)
SENSOR_ERR_M          = 0.01   # ≤ 1 cm → 센서 오차
CRACK_MAX_M           = 0.05   # 1–5 cm → 균열, 5 cm 초과 → 장애물

# 전역 탐색용 띠 두께(±) — 오차 임계와 동일
BAND_HALF_WIDTH_M     = SENSOR_ERR_M

# 전역 탐색 해상도
PHI_STEP_DEG          = 0.5
PHI_MIN_DEG           = 0.0
PHI_MAX_DEG           = 180.0

# 실행/판정 파라미터
RUN_DURATION_S        = 10.0      # 총 실행 시간(초)
CRACK_COUNT_THRESHOLD = 200       # 균열(이상치) 누적 개수 임계
# ------------------------------------------------

def best_gamma_for_band(alpha, beta, xs, ys, band_half):
    """고정 방향에서 띠 안에 최대한 많은 점을 포함하는 gamma 계산"""
    L = math.hypot(alpha, beta)
    if L == 0:
        return 0.0, np.zeros_like(xs, dtype=bool), 0

    s = -(alpha*xs + beta*ys)
    w = band_half * L

    events = []
    for si in s:
        events.append((si - w, +1))
        events.append((si + w, -1))
    events.sort(key=lambda x: (x[0], -x[1]))

    best_cnt = -1
    best_gamma = 0.0
    curr = 0
    for pos, delta in events:
        curr += delta
        if curr > best_cnt:
            best_cnt = curr
            best_gamma = pos

    d = np.abs(alpha*xs + beta*ys + best_gamma) / L
    inliers = d <= band_half
    return best_gamma, inliers, int(best_cnt)

def run_lidar_crack_detection():

    lidar = ydlidar.CYdLidar()
    lidar.setlidaropt(ydlidar.LidarPropSerialPort,              "/dev/ttyUSB0")
    lidar.setlidaropt(ydlidar.LidarPropSerialBaudrate,          128000)
    lidar.setlidaropt(ydlidar.LidarPropLidarType,               ydlidar.TYPE_TRIANGLE)
    lidar.setlidaropt(ydlidar.LidarPropDeviceType,              ydlidar.YDLIDAR_TYPE_SERIAL)
    lidar.setlidaropt(ydlidar.LidarPropSampleRate,              5)
    lidar.setlidaropt(ydlidar.LidarPropScanFrequency,           10.0)
    lidar.setlidaropt(ydlidar.LidarPropSingleChannel,           True)
    lidar.setlidaropt(ydlidar.LidarPropAutoReconnect,           True)
    lidar.setlidaropt(ydlidar.LidarPropSupportMotorDtrCtrl,     False)

    if not lidar.initialize() or not lidar.turnOn():
        print("[LiDAR][ERROR] LiDAR 초기화 또는 스캔 실패")
        return {
            "crack_detected": False,
            "suspicion_points": -1,
            "depth_max": 0.0
        }

    scan = ydlidar.LaserScan()
    print(f"[LiDAR] 실행 시작: 약 {RUN_DURATION_S:.1f}초 동안 동작")
    phi_grid = np.deg2rad(np.arange(PHI_MIN_DEG, PHI_MAX_DEG, PHI_STEP_DEG))

    crack_count_total = 0
    crack_depths_m = []

    t0 = time.time()
    try:
        while (time.time() - t0) < RUN_DURATION_S:
            if not lidar.doProcessSimple(scan):
                time.sleep(0.01)
                continue

            # 각도·거리 필터링
            thetas_deg, dists = [], []
            for p in scan.points:
                r = p.range
                if r <= 0 or r > MAX_DISTANCE_M: continue
                deg = (math.degrees(-p.angle)) % 360.0
                if ANGLE_MIN_DEG <= deg <= ANGLE_MAX_DEG:
                    thetas_deg.append(deg)
                    dists.append(r)

            if len(dists) < MIN_SAMPLES_FOR_FIT: continue

            thetas = np.radians(np.array(thetas_deg))
            dists  = np.array(dists)
            xs = dists * np.cos(thetas)
            ys = dists * np.sin(thetas)

            # 전역 탐색
            best_cnt, best_phi, best_gamma = -1, None, None
            for phi in phi_grid:
                alpha, beta  = math.cos(phi), math.sin(phi)
                gamma, inliers, cnt = best_gamma_for_band(alpha, beta, xs, ys, BAND_HALF_WIDTH_M)
                if cnt > best_cnt:
                    best_cnt, best_phi, best_gamma = cnt, phi, gamma

            # 수직거리 계산
            alpha, beta = math.cos(best_phi), math.sin(best_phi)
            L = math.hypot(alpha, beta)
            d_perp = np.abs(alpha*xs + beta*ys + best_gamma) / L

            # 균열 구간만 카운트 및 깊이 저장
            crack_mask = (d_perp > SENSOR_ERR_M) & (d_perp <= CRACK_MAX_M)
            crack_count_total += int(crack_mask.sum())
            if crack_mask.any():
                crack_depths_m.extend(d_perp[crack_mask].tolist())

    except KeyboardInterrupt:
        print("[LiDAR] 사용자 중단(Ctrl+C)")
    finally:
        lidar.turnOff()
        lidar.disconnecting()
        print("[LiDAR] 스캔 종료 및 연결 해제.")

    is_crack_detected = crack_count_total >= CRACK_COUNT_THRESHOLD
    max_depth_mm = 0.0
    
    if is_crack_detected and crack_depths_m:
        # 최대 깊이를 미터(m)에서 밀리미터(mm)로 변환
        max_depth_mm = float(np.max(crack_depths_m) * 1000.0)


    return {
        "crack_detected": is_crack_detected,
        "suspicion_points": crack_count_total,
        "depth_max": max_depth_mm
    }



if __name__ == '__main__':
    results = run_lidar_crack_detection()
    print("\n--- 최종 측정 결과 ---")
    print(results)