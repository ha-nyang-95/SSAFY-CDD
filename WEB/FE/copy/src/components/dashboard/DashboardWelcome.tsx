/**
 * 대시보드 환영 섹션 컴포넌트
 * 사용자 환영 메시지와 CDD 서비스 소개
 */

import { useAuth } from "../../hooks/auth/useAuth";

function DashboardWelcome() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
          // 인증 상태 확인
  
  // 사용자 이름 (로딩 중이거나 사용자가 없으면 기본값)
  const getUserName = () => {
    if (isLoading) return "로딩 중...";
    if (!user) return "Guest";
    
    // name 필드가 있으면 name 사용, 없으면 username 사용
    return user.name || user.username || "사용자";
  };
  
  const userName = getUserName();
  
  return (
    <div 
      className="rounded-2xl text-white p-8 md:p-12 mb-6 relative overflow-hidden min-h-[200px] md:min-h-[240px]"
      style={{
        backgroundImage: `url('/웰컴배너 이미지.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/70 rounded-2xl"></div>
      
      {/* 콘텐츠 */}
      <div className="relative z-10 flex items-center justify-between h-full">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            {/* CDD 로고 - 데스크톱에서만 표시 */}
            <div className="hidden lg:block">
              <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center p-2">
                <img 
                  src="/CDD로고.svg" 
                  alt="CDD 로고" 
                  className="w-12 h-12"
                  onError={(e) => {
                    // 로고 로드 실패 시 텍스트로 대체
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl font-bold text-purple-600">CDD</span>';
                    }
                  }}
                />
              </div>
            </div>
            <div>
                 <h1 className="text-3xl md:text-4xl font-bold">
                 안녕하세요, {userName || 'Guest'}님!
               </h1>
            </div>
          </div>
          <p className="text-indigo-100 text-xl md:text-2xl">
            CDD는 AI 기반 균열 탐지 서비스 입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardWelcome; 