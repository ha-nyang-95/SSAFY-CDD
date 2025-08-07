
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AuthForm from '../components/organisms/AuthForm';
import { useAuth } from '../contexts/AuthContext';
// import { login as apiLogin } from '../services/api';
// import { useMutation } from '@tanstack/react-query';

const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const { login } = useAuth();
  const navigate = useNavigate();

  // const loginMutation = useMutation({
  //   mutationFn: ({ username, password }: { username: string; password: string }) =>
  //     apiLogin(username, password),
  //   onSuccess: (data) => {
  //     if (data.success) {
  //       login(data.user || ''); // Assuming data.user contains the username
  //       setErrorMessage(undefined);
  //       navigate('/');
  //     } else {
  //       setErrorMessage(data.message || 'Login failed. Please try again.');
  //     }
  //   },
  //   onError: (error: any) => {
  //     setErrorMessage(error.response?.data?.message || 'An unexpected error occurred during login.');
  //   },
  // });

  // const handleSubmit = (data: { username: string; password: string }) => {
  //   setErrorMessage(undefined); // Clear previous errors
  //   loginMutation.mutate(data);
  // };

  const handleSubmit = async (data: { username: string; password: string }) => {
    setErrorMessage(undefined); // 이전 에러 메시지 초기화
    
    // AuthContext의 login 함수를 호출하고, 결과를 (success) 변수에 저장합니다.
    const success = await login(data.username, data.password);

    if (success) {
      // 성공 시 메인 페이지로 이동
      navigate('/');
    } else {
      // 실패 시 에러 메시지 설정
      setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSwitchAuth = () => {
    navigate('/signup');
  };

  const handleBypassClick = () => {
    navigate('/');
  };

  return (
    <AuthLayout>
      <AuthForm
        type="login"
        onSubmit={handleSubmit}
        onSwitchAuth={handleSwitchAuth}
        onBypassClick={handleBypassClick}
        errorMessage={errorMessage}
        // errorMessage={errorMessage || (loginMutation.isError ? loginMutation.error.message : undefined)}
      />
    </AuthLayout>
  );
};

export default LoginPage;
