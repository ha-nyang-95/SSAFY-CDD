import { DefaultTheme } from 'styled-components';

const theme: DefaultTheme = {
  // ⭐️ 1. 새로운 색상 팔레트로 전체를 교체합니다.
  colors: {
    primary: '#0A3D62',      // Deep Blue
    accent: '#0984E3',       // Bright Blue
    background: '#FFFFFF',   // White (기본 배경)
    surface: '#F1F2F6',      // Light Gray (카드 등 보조 배경)
    textPrimary: '#2F3640',  // Near Black
    textSecondary: '#747D8C',// Dark Gray
    border: '#CED6E0',       // Gray
    success: '#2ECC71',      // Green
    warning: '#F39C12',      // Amber
    danger: '#E74C3C',       // Red
    
    // 기존에 있던 색상들을 새로운 팔레트에 맞게 매핑합니다.
    info: '#0984E3',         // Accent 색상으로 대체
    darkSurface: '#2F3640',   // Near Black 색상으로 대체
  },

  // ⭐️ 2. 새로운 타이포그래피 규칙에 맞춰 폰트를 정의합니다.
  fonts: {
    main: "'Inter', sans-serif",          // 제목, UI 컨트롤용
    body: "'Source Sans Pro', sans-serif", // 본문, 데이터 표시용
  },

  // --- 아래는 가이드에 명시되지 않았으므로 기존 값을 유지합니다. ---
  fontSizes: {
    small: '0.875rem', // 14px
    medium: '1rem',    // 16px
    large: '1.125rem', // 18px
    xLarge: '1.5rem',  // 24px
  },
  spacings: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xLarge: '32px',
  },
  radii: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  shadows: {
    medium: '0 4px 12px rgba(0,0,0,0.08)',
  },
};

export default theme;