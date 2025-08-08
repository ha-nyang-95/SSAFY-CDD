/**
 * 대시보드 레이아웃 컴포넌트
 * 반응형 레이아웃: 웹에서는 사이드바, 모바일에서는 헤더/푸터
 */

import { type ReactNode } from 'react';
import { LeftSidebar, RightSidebar, Header, Footer } from '../components';
import { useResponsive } from '../hooks';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isDesktop, isMobile, isTablet } = useResponsive();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* 웹 사이드바 - 데스크톱에서만 표시 */}
      {isDesktop && (
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>
      )}
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 모바일/태블릿 헤더 - 모바일과 태블릿에서 표시 */}
        {(isMobile || isTablet) && (
          <div className="lg:hidden">
            <Header />
          </div>
        )}
        
        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 h-full">
            {children}
          </div>
        </main>
        
        {/* 모바일/태블릿 푸터 - 모바일과 태블릿에서 표시 */}
        {(isMobile || isTablet) && (
          <div className="lg:hidden">
            <Footer />
          </div>
        )}
      </div>
      
      {/* 웹 오른쪽 사이드바 - 데스크톱에서만 표시 */}
      {isDesktop && (
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      )}
    </div>
  );
}

export default DashboardLayout; 