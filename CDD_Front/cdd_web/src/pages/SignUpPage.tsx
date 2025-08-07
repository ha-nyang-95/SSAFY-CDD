
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AuthForm from '../components/organisms/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { signup as apiSignup } from '../services/api';
import { useMutation } from '@tanstack/react-query';

const SignUpPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { login } = useAuth();
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: ({ username, password, employeeId }: { username: string; password: string; employeeId?: string }) =>
      apiSignup(username, password, employeeId || ''),
    onSuccess: (data) => {
      if (data.success) {
        alert('회원가입 성공! 로그인 해주세요.');
        setErrorMessage(undefined);
        navigate('/login');
      } else {
        setErrorMessage(data.message || '회원가입 실패. 다시 시도해주세요.');
      }
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || '회원가입 중 예상치 못한 오류가 발생했습니다.');
    },
  });

  const handleSubmit = (data: { username: string; password: string; employeeId?: string }) => {
    setErrorMessage(undefined);
    signupMutation.mutate(data);
  };

  const handleSwitchAuth = () => {
    navigate('/login');
  };

  return (
    <AuthLayout>
      <AuthForm
        type="signup"
        onSubmit={handleSubmit}
        onSwitchAuth={handleSwitchAuth}
        errorMessage={errorMessage || (signupMutation.isError ? signupMutation.error.message : undefined)}
      />
    </AuthLayout>
  );
};

export default SignUpPage;
