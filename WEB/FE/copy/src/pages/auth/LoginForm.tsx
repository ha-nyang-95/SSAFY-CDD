/**
 * 로그인 폼 컴포넌트
 * Axios API 통신을 사용한 로그인 기능
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";
import type { LoginRequest } from "../../types";

interface LoginFormProps {
  onTabChange: (tab: 'login' | 'signup') => void;
}

function LoginForm({ onTabChange }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로그인 폼 데이터
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  // 폼 입력 처리
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // 로그인 폼 제출
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await login(loginForm);
      
      if (result.success) {
        // 로그인 성공 후 대시보드로 이동
        navigate('/');
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      <div>
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="loginEmail"
          name="email"
          type="email"
          required
          value={loginForm.email}
          onChange={handleLoginChange}
          placeholder="이메일을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호
        </label>
        <input
          id="loginPassword"
          name="password"
          type="password"
          required
          value={loginForm.password}
          onChange={handleLoginChange}
          placeholder="비밀번호를 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            로그인 중...
          </div>
        ) : (
          '로그인'
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
}

export default LoginForm; 