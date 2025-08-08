
import React, { useState } from 'react';
import styled from 'styled-components';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import ErrorMessage from '../molecules/ErrorMessage';

const AuthBox = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 40px; /* Specific value from mockup */
  border-radius: ${(props) => props.theme.radii.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const AuthFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacings.medium};
  width: 100%;
`;

const AuthTitle = styled(Text)`
  margin-bottom: ${(props) => props.theme.spacings.large};
  color: ${(props) => props.theme.colors.primary};
`;

const SwitchAuthButtonContainer = styled.div`
  margin-top: ${(props) => props.theme.spacings.large};
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacings.medium};
`;

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: { username: string; password: string; employeeId?: string }) => void;
  onSwitchAuth: () => void;
  onBypassClick?: () => void;
  errorMessage?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  onSwitchAuth,
  onBypassClick,
  errorMessage,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'login') {
      onSubmit({ username, password });
    } else {
      onSubmit({ username, password, employeeId });
    }
  };

  return (
    <AuthBox>
      <AuthTitle variant="h2">
        {type === 'login' ? '구조물 안전 모니터링 시스템' : '회원가입'}
      </AuthTitle>
      <AuthFormContainer onSubmit={handleSubmit}>
        <Input
          id="username"
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {type === 'signup' && (
          <Input
            id="employeeId"
            type="text"
            placeholder="사원번호"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />
        )}
        {errorMessage && <ErrorMessage message={errorMessage} />}
        <Button type="submit" variant="auth">
          {type === 'login' ? '로그인' : '가입하기'}
        </Button>
      </AuthFormContainer>
      <SwitchAuthButtonContainer>
        {type === 'login' && (
          <Button variant="switch-auth" onClick={onBypassClick}>
            둘러보기
          </Button>
        )}
        <Button variant="switch-auth" onClick={onSwitchAuth}>
          {type === 'login' ? '회원가입' : '로그인 페이지로 돌아가기'}
        </Button>
      </SwitchAuthButtonContainer>
    </AuthBox>
  );
};

export default AuthForm;
