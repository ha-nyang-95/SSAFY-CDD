/**
 * 라우터 설정
 * 모든 컴포넌트에 lazy loading 적용
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '../components';

// Lazy loading을 위한 페이지 컴포넌트들
const DashboardPage = lazy(() => import('../pages').then(module => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import('../pages').then(module => ({ default: module.LoginPage })));
const DroneRegisterPage = lazy(() => import('../pages').then(module => ({ default: module.DroneRegisterPage })));

// 추가 페이지들 (향후 확장용)
const DetectionPage = lazy(() => import('../pages').then(module => ({ default: module.DetectionPage })));
const RenderingPage = lazy(() => import('../pages').then(module => ({ default: module.RenderingPage })));
const SettingsPage = lazy(() => import('../pages').then(module => ({ default: module.SettingsPage })));
const MyPage = lazy(() => import('../pages').then(module => ({ default: module.MyPage })));
const MapPage = lazy(() => import('../pages').then(module => ({ default: module.MapPage })));

// 로딩 스피너 컴포넌트
const LoadingSpinnerComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" text="페이지를 불러오는 중..." />
  </div>
);

// 라우터 컴포넌트
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinnerComponent />}>
      <Routes>
        {/* 메인 라우트 */}
        <Route path="/" element={<DashboardPage />} />
        
        {/* 인증 관련 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 드론 관련 라우트 */}
        <Route path="/drone-register" element={<DroneRegisterPage />} />
        
        {/* 기능별 라우트 */}
        <Route path="/detection" element={<DetectionPage />} />
        <Route path="/rendering" element={<RenderingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/map" element={<MapPage />} />
        
        {/* 404 페이지 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  대시보드로 돌아가기
                </a>
              </div>
            </div>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 