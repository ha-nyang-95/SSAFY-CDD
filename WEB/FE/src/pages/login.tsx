import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../api/auth';

const Page = styled.div((p) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: p.theme.spacing['3xl'],
  background: p.theme.colors.gradients.background,
  [`@media (max-width: ${p.theme.layout.breakpoints.mobile})`]: {
    padding: p.theme.spacing.lg,
  },
}));

const Card = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.elevated.backgroundColor,
  borderRadius: p.theme.components.cards.elevated.borderRadius,
  padding: p.theme.components.cards.elevated.padding,
  boxShadow: p.theme.components.cards.elevated.boxShadow,
  width: '100%',
  maxWidth: '480px',
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.xl,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: p.theme.colors.gradients.primary,
  },
  [`@media (max-width: ${p.theme.layout.breakpoints.mobile})`]: {
    padding: p.theme.spacing.xl,
    gap: p.theme.spacing.lg,
  },
}));

const Title = styled.h1((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h3.fontSize,
  fontWeight: p.theme.typography.scales.h3.fontWeight,
  lineHeight: p.theme.typography.scales.h3.lineHeight,
  color: p.theme.colors.primary.text_primary,
  margin: 0,
  textAlign: 'center',
}));

const Subtitle = styled.p((p) => ({
  color: p.theme.colors.primary.text_secondary,
  fontSize: p.theme.typography.scales.body_large.fontSize,
  lineHeight: p.theme.typography.scales.body_large.lineHeight,
  margin: 0,
  textAlign: 'center',
  // 제목과 부제목 사이 간격을 토큰 기반으로 부여하여 가독성 향상
  marginTop: p.theme.spacing.sm,
}));

const FormGroup = styled.div((p) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.sm,
}));

const Label = styled.label((p) => ({
  fontSize: p.theme.typography.scales.body_small.fontSize,
  fontWeight: '600',
  color: p.theme.colors.primary.text_primary,
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.sm,
}));

const ButtonGroup = styled.div((p) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.md,
  marginTop: p.theme.spacing.md,
}));

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 한국어 주석: 로그인 성공 시 서버가 쿠키를 설정하므로 별도 토큰 저장이 필요 없습니다.
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      const message = (err as Error)?.message || '로그인에 실패했습니다.';
      // 모달 alert 대신 비차단 토스트로 안내
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'error' } }));
    }
  };

  return (
    <Page>
      <Card as="form" onSubmit={onSubmit} aria-labelledby="login-title">
        <div>
          <Title id="login-title">CDD 로그인</Title>
          <Subtitle>안전한 드론 점검 시스템에 접속하세요</Subtitle>
        </div>
        
        <FormGroup>
          <Label>
            이메일 주소
            <Input
              type="email"
              value={email}
              placeholder="example@company.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Label>
          
          <Label>
            비밀번호
            <Input
              type="password"
              value={password}
              placeholder="비밀번호를 입력하세요"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Label>
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" size="lg">
            로그인
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="md"
            onClick={() => navigate('/signup')}
          >
            아직 계정이 없으신가요? 회원가입
          </Button>
        </ButtonGroup>
      </Card>
    </Page>
  );
}


