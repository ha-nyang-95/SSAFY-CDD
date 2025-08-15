import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { checkEmail, signUp } from '../api/auth';

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
  gap: p.theme.spacing.lg,
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

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<string>('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await checkEmail(email);
      if (!ok) {
        window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '이미 사용 중인 이메일입니다.', type: 'warning' } }));
        return;
      }
      await signUp({ name, email, password, regionName: region || undefined });
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '가입이 완료되었습니다. 로그인해 주세요.', type: 'success' } }));
      navigate('/login');
    } catch (err) {
      const message = (err as Error)?.message || '회원가입에 실패했습니다.';
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type: 'error' } }));
    }
  };

  return (
    <Page>
      <Card as="form" onSubmit={onSubmit} aria-labelledby="signup-title">
        <div>
          <Title id="signup-title">CDD 회원가입</Title>
          <Subtitle>드론 점검 시스템 계정을 생성하세요</Subtitle>
        </div>
        
        <FormGroup>
          <Label>
            이름
            <Input 
              value={name} 
              placeholder="홍길동" 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </Label>
          
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
              placeholder="안전한 비밀번호를 입력하세요" 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </Label>

          <Label>
            지역
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                color: 'inherit',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '16px',
                fontFamily: 'inherit',
              }}
            >
              <option value="">선택하세요</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="대구광역시">대구광역시</option>
              <option value="인천광역시">인천광역시</option>
              <option value="광주광역시">광주광역시</option>
              <option value="대전광역시">대전광역시</option>
              <option value="울산광역시">울산광역시</option>
              <option value="세종특별자치시">세종특별자치시</option>
              <option value="경기도">경기도</option>
              <option value="강원특별자치도">강원특별자치도</option>
              <option value="충청북도">충청북도</option>
              <option value="충청남도">충청남도</option>
              <option value="전라북도">전라북도</option>
              <option value="전라남도">전라남도</option>
              <option value="경상북도">경상북도</option>
              <option value="경상남도">경상남도</option>
              <option value="제주특별자치도">제주특별자치도</option>
            </select>
          </Label>
        </FormGroup>

        <ButtonGroup>
          <Button type="submit" size="lg">
            계정 만들기
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="md"
            onClick={() => navigate('/login')}
          >
            이미 계정이 있으신가요? 로그인
          </Button>
        </ButtonGroup>
      </Card>
    </Page>
  );
}


