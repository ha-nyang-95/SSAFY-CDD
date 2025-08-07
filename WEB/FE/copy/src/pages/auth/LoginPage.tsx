/**
 * 로그인/회원가입 페이지
 * 탭 기반의 인증 페이지
 */

import { useState } from 'react';
import { LoginForm, SignUpForm } from './';

function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* CDD 로고 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <img 
              src="/CDD로고.svg" 
              alt="CDD 로고" 
              className="w-12 h-12"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-2xl font-bold text-purple-600">CDD</span>';
                }
              }}
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            CDD 대시보드
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AI 기반 균열 탐지 서비스
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-l-lg transition-colors ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-r-lg transition-colors ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 폼 컨테이너 */}
          <div className="p-6">
            {activeTab === 'login' ? (
              <LoginForm onTabChange={setActiveTab} />
            ) : (
              <SignUpForm onTabChange={setActiveTab} />
            )}
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 CDD. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 