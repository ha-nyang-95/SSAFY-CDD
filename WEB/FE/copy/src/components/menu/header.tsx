/**
 * 헤더/네비게이션 컴포넌트
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 인증 상태 변화 감지
  useEffect(() => {
    // 인증 상태가 변경될 때 필요한 로직이 있다면 여기에 추가
    if (!isAuthenticated && !isLoading) {
      // 로그아웃된 경우 메뉴 닫기
      setIsMenuOpen(false);
      setIsProfileOpen(false);
    }
  }, [isAuthenticated, user, isLoading]);

  // 로그아웃 처리
  const handleLogoutClick = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsProfileOpen(false);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  // 역할별 한글 표시
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'GENERAL': return '일반 사용자';
      default: return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* 햄버거 메뉴 */}
        <div className="relative">
          <button 
            className="p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <nav className="py-2">
                <NavLink 
                  to="/" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  대시보드
                </NavLink>
                <NavLink 
                  to="/detection" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  탐지하기
                </NavLink>
                <NavLink 
                  to="/rendering" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  3D 렌더링
                </NavLink>
                <NavLink 
                  to="/drone-register" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  드론 등록
                </NavLink>
                <NavLink 
                  to="/map" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    
                    <span>지도 보기</span>
                  </div>
                </NavLink>
                
                {/* 로그인 상태에 따른 메뉴 */}
                <hr className="my-2 border-gray-200" />
                {isAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500">
                      <div className="font-medium">{user.name || user.username}</div>
                      <div className="text-xs">{getRoleDisplayName(user.role)}</div>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <NavLink 
                    to="/login" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </NavLink>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* 로고 */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CDD</span>
            </div>
            <span className="font-bold text-gray-900">CDD 대시보드</span>
          </NavLink>
        </div>

        {/* 사용자 프로필 */}
        <div className="relative">
          {isAuthenticated && user ? (
            <button
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name ? user.name.charAt(0) : user.username.charAt(0)}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user.name || user.username}
              </span>
            </button>
          ) : (
            <NavLink 
              to="/login"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              로그인
            </NavLink>
          )}

          {/* 프로필 드롭다운 */}
          {isProfileOpen && isAuthenticated && user && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-500">
                  <div className="font-medium">{user.name || user.username}</div>
                  <div className="text-xs">{user.email}</div>
                  <div className="text-xs">{getRoleDisplayName(user.role)}</div>
                </div>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 