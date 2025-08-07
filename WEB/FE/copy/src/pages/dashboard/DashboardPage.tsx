/**
 * 대시보드 메인 페이지
 * 사용자 환영 메시지와 각종 섹션들을 포함한 메인 대시보드
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts';
import { DashboardWelcome, CrackLiveSection, HistorySection, RenderingSection, LoadingSpinner, LocationPermissionModal } from '../../components';
import { useResponsive } from '../../hooks';

// 섹션 로딩 스피너
const SectionLoadingSpinner = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 h-64 flex items-center justify-center">
    <LoadingSpinner size="md" text="섹션을 불러오는 중..." />
  </div>
);

function DashboardPage() {
  const { isDesktop, isXl } = useResponsive();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // 페이지 렌더링 상태 관리

  // 데스크톱에서 위치 권한 확인 및 모달 표시
  useEffect(() => {
    if (isDesktop && !hasLocationPermission) {
      // 데스크톱에서만 위치 권한 확인
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'prompt') {
            // 권한이 아직 요청되지 않은 경우 모달 표시
            setTimeout(() => {
              setShowLocationModal(true);
            }, 2000); // 2초 후 모달 표시
          } else if (result.state === 'granted') {
            setHasLocationPermission(true);
          }
        });
      }
    }
  }, [isDesktop, hasLocationPermission]);

  // 위치 권한 허용 시 처리
  const handlePermissionGranted = () => {
    setHasLocationPermission(true);
    setShowLocationModal(false);
  };

  return (
    <DashboardLayout>
      {/* 위치 권한 모달 */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onPermissionGranted={handlePermissionGranted}
      />
      
      <div className="space-y-6">
        {/* 환영 배너 섹션 */}
        <Suspense fallback={<SectionLoadingSpinner />}>
          <DashboardWelcome />
        </Suspense>
        
        {/* 메인 대시보드 그리드 - 반응형 레이아웃 */}
        <div className={`
          grid gap-6
          ${isDesktop && !isXl 
            ? 'grid-cols-1 md:grid-cols-2' // 1024px~1280px: 2열 레이아웃
            : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' // 기존 레이아웃
          }
        `}>
          {/* 3D 렌더링 섹션 */}
          <div className={`
            ${isDesktop && !isXl 
              ? 'md:col-span-1' // 1024px~1280px: 1열
              : 'xl:col-span-1' // 기존 레이아웃
            }
          `}>
            <Suspense fallback={<SectionLoadingSpinner />}>
              <RenderingSection />
            </Suspense>
          </div>
          
          {/* 렌더링 이력 섹션 */}
          <div className={`
            ${isDesktop && !isXl 
              ? 'md:col-span-1' // 1024px~1280px: 1열
              : 'lg:col-span-2 xl:col-span-1' // 기존 레이아웃
            }
          `}>
            <Suspense fallback={<SectionLoadingSpinner />}>
              <HistorySection />
            </Suspense>
          </div>
          
          {/* CrackLive 실시간 모니터링 섹션 */}
          <div className={`
            ${isDesktop && !isXl 
              ? 'md:col-span-2' // 1024px~1280px: 전체 너비
              : 'xl:col-span-1' // 기존 레이아웃
            }
          `}>
            <Suspense fallback={<SectionLoadingSpinner />}>
              <CrackLiveSection />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// 개발자 도구에서 컴포넌트 이름을 명확히 표시
DashboardPage.displayName = 'DashboardPage';

export default DashboardPage; 