import styled from '@emotion/styled';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppThemeProvider } from '../theme';
import Button from '../components/Button';
import { logout } from '../api/auth';
import { isDemoMode } from '../api/client';
import { useState, useEffect } from 'react';

const Header = styled.header((p) => ({
  height: p.theme.components.navigation.height,
  backgroundColor: p.theme.components.navigation.backgroundColor,
  backdropFilter: p.theme.components.navigation.backdropFilter,
  borderBottom: p.theme.components.navigation.borderBottom,
  padding: p.theme.components.navigation.padding,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

const Brand = styled.div((p) => ({
  display: 'flex',
  alignItems: 'center',
  gap: p.theme.spacing.md,
  color: p.theme.colors.primary.text_primary,
  fontFamily: p.theme.typography.fonts.heading,
  fontWeight: 800,
  letterSpacing: '-0.5px',
  // 상단바 높이에 비례해 글씨 크기를 키워 상단바와 비율 맞춤
  fontSize: `calc(${p.theme.components.navigation.height} * 0.5)`,
  lineHeight: p.theme.components.navigation.height,
  '@media (max-width: 768px)': {
    fontSize: 'clamp(18px, 5vw, 22px)',
  },
}));

const Right = styled.div((p) => ({
  display: 'flex',
  alignItems: 'center',
  gap: p.theme.spacing.md,
  color: p.theme.colors.primary.text_secondary,
  fontSize: `calc(${p.theme.components.navigation.height} * 0.22)`,
  lineHeight: p.theme.components.navigation.height,
  '@media (max-width: 768px)': {
    gap: p.theme.spacing.sm,
  },
}));

const Container = styled.main((p) => ({
  maxWidth: p.theme.layout.maxWidth,
  padding: `${p.theme.spacing['4xl']} ${p.theme.layout.container.padding}`,
  margin: p.theme.layout.container.margin,
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'flex-start',
  '@media (max-width: 768px)': {
    padding: `${p.theme.spacing.lg} ${p.theme.layout.container.padding}`,
  },
}));

export default function Layout() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('app:color-mode') === 'dark' ? 'dark' : 'light'); } catch { return 'light'; }
  });
  useEffect(() => {
    try { localStorage.setItem('app:color-mode', mode); } catch {}
  }, [mode]);
  return (
    <AppThemeProvider mode={mode}>
      <Header>
        <Brand
          role="button"
          tabIndex={0}
          onClick={() => navigate('/dashboard')}
          title="Crack Detection Drone"
          aria-label="CDD 홈으로 이동"
        >
          {/* 요청에 따라 로고 아이콘 제거, 텍스트만 간결하게 노출 */}
          CDD
        </Brand>
        <Right>
          <Button
            variant="secondary"
            onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
            aria-label="테마 전환"
            title={mode === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {mode === 'dark' ? '라이트 모드' : '다크 모드'}
          </Button>
          {/* 라이트모드 기본: 토글과 로그아웃만 표시. 대시보드 버튼 제거 */}
          {/* 로그인은 초기 단계에서 완료된다고 가정하므로, 헤더에는 로그아웃 버튼을 제공합니다. */}
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await logout();
              } catch {}
              // 한국어 주석: 로그아웃 시 라이트 모드로 초기화하여 로그인 화면 가독성 보장
              try {
                localStorage.setItem('app:color-mode', 'light');
              } catch {}
              setMode('light');
              navigate('/login');
            }}
          >
            로그아웃
          </Button>
        </Right>
      </Header>
      <Container>
        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </Container>
    </AppThemeProvider>
  );
}
