import { ThemeProvider, Global, css } from '@emotion/react';
import type { ReactNode } from 'react';
import tokens from './tokens';
import type { AppTheme } from './tokens';

declare module '@emotion/react' {
  export interface Theme extends AppTheme {}
}

type Props = { children: ReactNode; mode?: Mode };

type Mode = 'light' | 'dark';

function getModeFromStorage(): Mode {
  try {
    const m = localStorage.getItem('app:color-mode');
    return (m === 'dark' ? 'dark' : 'light');
  } catch { return 'light'; }
}

function setModeToStorage(mode: Mode) {
  try { localStorage.setItem('app:color-mode', mode); } catch {}
}

const globalStyles = (t: AppTheme, mode: Mode) => css`
  :root { color-scheme: ${mode}; }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body, #root {
    height: 100%;
    width: 100%;
  }
  html {
    /* 한국어 주석: 기기 폭에 맞춰 기본 글자 크기를 유동적으로 조정 */
    font-size: clamp(14px, 1.6vw, 16px);
  }
  body {
    margin: 0;
    overflow-x: hidden;
    font-family: ${t.typography.fonts.body};
    color: ${t.colors.primary.text_primary};
    background: ${t.colors.gradients.background};
    display: block;
  }
  a { color: inherit; text-decoration: none; }
  img, video { max-width: 100%; height: auto; display: block; }
  /* 반응형 타이포그래피: 화면 너비에 따라 글자 크기를 유연 조정 */
  h1 { font-size: clamp(28px, 4.5vw, ${t.typography.scales.h1.fontSize}); }
  h2 { font-size: clamp(24px, 4vw, ${t.typography.scales.h2.fontSize}); }
  h3 { font-size: clamp(20px, 3.2vw, ${t.typography.scales.h3.fontSize}); }
  h4 { font-size: clamp(18px, 2.6vw, ${t.typography.scales.h4.fontSize}); }
  body, p { font-size: clamp(14px, 2.4vw, ${t.typography.scales.body.fontSize}); }
`;

export function AppThemeProvider({ children, mode: forcedMode }: Props) {
  const mode: Mode = forcedMode ?? getModeFromStorage();
  const isDark = mode === 'dark';
  const themed: AppTheme = isDark ? buildDarkTheme(tokens) : tokens;
  return (
    <ThemeProvider theme={themed}>
      <Global styles={globalStyles(themed, mode)} />
      {children}
    </ThemeProvider>
  );
}

function buildDarkTheme(base: AppTheme): AppTheme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: {
        ...base.colors.primary,
        background: '#0F1115',
        surface: '#161A22',
        text_primary: '#E6E9EF',
        text_secondary: '#A6B0BF',
        // 한국어 주석: 다크 모드에서 보조 텍스트 대비를 유지하기 위한 톤 조정
        text_muted: '#8A94A6',
      },
      neutral: {
        ...base.colors.neutral,
        50: '#161A22',
        100: '#1C2230',
        200: '#273246',
        300: '#3A475F',
        400: '#748199',
        500: '#8F9AAF',
        600: '#A4AEC1',
        700: '#B9C2D0',
        800: '#D3D9E3',
        900: '#E6E9EF',
      },
      secondary: {
        ...base.colors.secondary,
        hover: 'rgba(255,255,255,0.06)',
        active: 'rgba(255,255,255,0.1)'
      },
      semantic: {
        ...base.colors.semantic,
        info_light: 'rgba(0,0,0,0.2)'
      },
      gradients: {
        ...base.colors.gradients,
        background: 'linear-gradient(180deg, #0F1115 0%, #161A22 100%)',
        card: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.02) 100%)',
      },
    },
    components: {
      ...base.components,
      cards: {
        ...base.components.cards,
        default: {
          ...base.components.cards.default,
          backgroundColor: '#161A22',
          border: '1px solid #273246',
        },
        elevated: {
          ...base.components.cards.elevated,
          backgroundColor: '#161A22',
          // 다크 모드에서 카드 대비 확보
          // boxShadow는 기본 유지
        },
      },
      navigation: {
        ...base.components.navigation,
        backgroundColor: 'rgba(15,17,21,0.95)',
        borderBottom: '1px solid #273246',
      },
      inputs: {
        ...base.components.inputs,
        default: {
          ...base.components.inputs.default,
          backgroundColor: '#0F1115',
          border: '1.5px solid #273246',
        },
      },
    },
  };
}


