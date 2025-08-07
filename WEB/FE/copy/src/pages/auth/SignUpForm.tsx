/**
 * 회원가입 폼 컴포넌트
 * Axios API 통신을 사용한 회원가입 기능
 */

import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth";
import type { SignUpRequest } from "../../types";

interface SignUpFormProps {
  onTabChange: (tab: 'login' | 'signup') => void;
}

function SignUpForm({ onTabChange }: SignUpFormProps) {
  const { signUp } = useAuth();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 회원가입 폼 데이터
  const [signupForm, setSignupForm] = useState<SignUpRequest>({
    email: '',
    password: '',
    name: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // 폼 입력 처리
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setSignupForm(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // 회원가입 유효성 검사
  const validateSignup = (): string | null => {
    if (!signupForm.email || !signupForm.password || !signupForm.name) {
      return '모든 필드를 입력해주세요.';
    }
    
    if (signupForm.password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    
    if (signupForm.password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(signupForm.password)) {
      return '비밀번호는 영문 대/소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.';
    }
    
    if (signupForm.name.length < 2 || signupForm.name.length > 10) {
      return '이름은 2자 이상 10자 이하로 입력해주세요.';
    }
    
    const nameRegex = /^[가-힣a-zA-Z]+$/;
    if (!nameRegex.test(signupForm.name)) {
      return '이름은 한글 또는 영문만 입력 가능합니다.';
    }
    
    return null;
  };

  // 회원가입 폼 제출
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateSignup();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const result = await signUp(signupForm);
      
      if (result.success) {
        setSuccess(result.message || '회원가입이 완료되었습니다.');
        // 3초 후 로그인 탭으로 전환
        setTimeout(() => {
          onTabChange('login');
          setSuccess(null);
        }, 3000);
      } else {
        setError(result.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignupSubmit} className="space-y-6">
      <div>
        <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700 mb-2">
          이메일 <span className="text-red-500">*</span>
        </label>
        <input
          id="signupEmail"
          name="email"
          type="email"
          required
          value={signupForm.email}
          onChange={handleSignupChange}
          placeholder="example@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="signupName" className="block text-sm font-medium text-gray-700 mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="signupName"
          name="name"
          type="text"
          required
          value={signupForm.name}
          onChange={handleSignupChange}
          placeholder="홍길동"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          한글 또는 영문 2-10자
        </p>
      </div>

      <div>
        <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 <span className="text-red-500">*</span>
        </label>
        <input
          id="signupPassword"
          name="password"
          type="password"
          required
          value={signupForm.password}
          onChange={handleSignupChange}
          placeholder="영문 대/소문자, 숫자, 특수문자 포함 8자 이상"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          영문 대/소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 확인 <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={handleSignupChange}
          placeholder="비밀번호를 다시 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !!success}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            회원가입 중...
          </div>
        ) : success ? (
          '회원가입 완료!'
        ) : (
          '회원가입'
        )}
      </button>

      {/* 성공 메시지 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">{success}</p>
          <p className="text-green-500 text-xs mt-1">잠시 후 로그인 탭으로 이동합니다...</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
}

export default SignUpForm; 