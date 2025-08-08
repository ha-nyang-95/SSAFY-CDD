/**
 * 왼쪽 사이드바 네비게이션 컴포넌트
 * 보라색 배경의 세로 네비게이션 메뉴
 */

import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/auth/useAuth";

function LeftSidebar() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // 역할별 한글 표시
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'GENERAL': return '일반 사용자';
      default: return role;
    }
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공 후 처리
    } catch (error) {
      // 로그아웃 실패 처리
    }
  };

  // 네비게이션 메뉴 아이템들
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'cracklive',
      label: 'CrackLive',
      path: '/detection',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: '3d-rendering',
      label: '3D Rendering',
      path: '/rendering',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/mypage',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-24 h-full bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col">
      {/* 로고 영역 */}
      <div className="p-4 text-center border-b border-purple-600">
        <NavLink to="/" className="block hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto p-1">
            <img 
              src="/CDD로고.svg" 
              alt="CDD 로고" 
              className="w-10 h-10"
              onError={(e) => {
                // 로고 로드 실패 시 텍스트로 대체
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-lg font-bold text-purple-600">CDD</span>';
                }
              }}
            />
          </div>
        </NavLink>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  group relative flex flex-col items-center px-3 py-4 text-xs transition-colors
                  ${isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                  }
                `}
                title={item.label}
              >
                {item.icon}
                <span className="mt-1 text-center leading-none">{item.label}</span>
                
                {/* 툴팁 */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 사용자 프로필 영역 - 로그인된 경우에만 표시 */}
      {isAuthenticated && user && (
        <div className="p-4 border-t border-purple-600">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-200 mt-1">로딩 중...</span>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex flex-col items-center w-full hover:bg-purple-600 rounded p-2 transition-colors"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium text-sm">
                    {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-purple-200 mt-1 truncate max-w-full">
                  {user.name || user.username}
                </span>
              </button>

              {/* 프로필 드롭다운 */}
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-500">
                      <div className="font-medium">{user.name || user.username}</div>
                      <div className="text-xs">{user.email}</div>
                      <div className="text-xs">{getRoleDisplayName(user.role)}</div>
                    </div>
                    <hr className="my-2 border-gray-200" />
                                         <NavLink
                       to="/mypage"
                       className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm transition-colors"
                       onClick={() => setIsProfileMenuOpen(false)}
                     >
                       설정
                     </NavLink>
                     <button 
                       onClick={handleLogout}
                       className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm transition-colors"
                     >
                       로그아웃
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 로그인 버튼 - 로그아웃 상태일 때만 표시 */}
      {!isAuthenticated && !isLoading && (
        <div className="p-4 border-t border-purple-600">
          <NavLink
            to="/login"
            className="flex flex-col items-center w-full bg-white text-purple-600 text-xs font-medium py-2 px-2 rounded hover:bg-purple-50 transition-colors"
          >
            <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            로그인
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default LeftSidebar; 