import raw from '../../style.json';

// style.json 기반 테마 매핑

export interface AppTheme {
  colors: {
    primary: { text_primary: string; text_secondary: string; text_muted: string; accent: string; accent_light: string; accent_dark: string; background: string; surface: string };
    secondary: { medium: string; light: string; hover: string; active: string; dark: string };
    gradients: { background: string; card: string; primary: string };
    borders: { subtle: string; muted: string; strong: string };
    risk: { highBg: string; mediumBg: string; lowBg: string };
    semantic: {
      success: string; success_light: string;
      warning: string; warning_light: string;
      error: string; error_light: string;
      info: string; info_light: string;
    };
    neutral: { 
      50: string; 100: string; 200: string; 300: string; 400: string; 
      500: string; 600: string; 700: string; 800: string; 900: string; 
    };
  };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string; '2xl': string; '3xl': string; '4xl': string; '5xl': string };
  typography: {
    fonts: { body: string; heading: string };
    scales: {
      h1: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      h2: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      h3: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      h4: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      body: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      body_large: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      body_small: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      caption: { fontSize: string; fontWeight: string | number; lineHeight: string; letterSpacing: string };
      button: { fontSize: string; fontWeight: string | number; letterSpacing: string };
    };
  };
  layout: {
    maxWidth: string;
    breakpoints: { mobile: string; wide: string };
    container: { padding: string; margin: string };
    grid: { gap: string };
  };
  effects: { 
    transitions: { fast: string; normal: string; slow: string }; 
    shadows: { xs: string; sm: string; md: string; lg: string; xl: string; card: string; button: string; modal: string }; 
    focusRing: string 
  };
  components: {
    buttons: {
      primary: { backgroundColor: string; color: string; border: string; padding: string; borderRadius: string; transition?: string; cursor?: string; boxShadow?: string; fontWeight?: string; };
      secondary: { backgroundColor: string; color: string; border: string; padding: string; borderRadius: string; transition?: string; cursor?: string; fontWeight?: string; };
      ghost: { backgroundColor: string; color: string; border: string; padding: string; borderRadius?: string; transition?: string; cursor?: string; fontWeight?: string; };
    };
    cards: { 
      default: { backgroundColor: string; borderRadius: string; padding: string; border?: string; backdropFilter?: string };
      elevated: { backgroundColor: string; borderRadius: string; padding: string; boxShadow?: string };
      testimonial: { backgroundColor: string; borderRadius: string; padding: string; border?: string };
    };
    inputs: {
      default: { 
        backgroundColor: string; 
        borderRadius: string; 
        padding: string; 
        border: string; 
        fontSize: string; 
        transition: string;
        focusBorderColor: string;
        focusBoxShadow: string;
      };
    };
    navigation: { height: string; backgroundColor: string; borderBottom: string; padding: string; backdropFilter: string };
    sections: { footer: { borderTop: string } };
  };
}

const src: any = raw.theme;

function pick<T>(...vals: (T | undefined)[]): T {
  for (const v of vals) if (v !== undefined) return v as T;
  // @ts-expect-error 기본값 없음 시 undefined
  return undefined;
}

export const tokens: AppTheme = {
  colors: {
    primary: {
      text_primary: pick(src.colors?.primary?.text_primary, '#0d1421'),
      text_secondary: pick(src.colors?.primary?.text_secondary, '#475569'),
      text_muted: pick(src.colors?.primary?.text_muted, '#94a3b8'),
      accent: pick(src.colors?.primary?.accent, '#2196f3'),
      accent_light: pick(src.colors?.primary?.accent_light, '#64b5f6'),
      accent_dark: pick(src.colors?.primary?.accent_dark, '#1976d2'),
      background: pick(src.colors?.primary?.background, '#ffffff'),
      surface: pick(src.colors?.primary?.surface, '#f8fafc'),
    },
    secondary: {
      medium: pick(src.colors?.secondary?.medium, '#5a5a5a'),
      light: pick(src.colors?.secondary?.light, '#f1f3f5'),
      hover: pick(src.colors?.secondary?.hover, 'rgba(33, 150, 243, 0.08)'),
      active: pick(src.colors?.secondary?.active, 'rgba(33, 150, 243, 0.12)'),
      dark: pick(src.colors?.secondary?.dark, '#37474f'),
    },
    gradients: {
      background: pick(src.colors?.gradients?.background, 'linear-gradient(180deg, #ffffff 0%, #f1f3f5 100%)'),
      card: pick(src.colors?.gradients?.card, 'linear-gradient(145deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)'),
      primary: pick(src.colors?.gradients?.primary, 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'),
    },
    borders: {
      subtle: pick(src.components?.cards?.default?.border, '1px solid #e9ecef'),
      muted: '1px solid #e9ecef',
      strong: '1px solid #333333',
    },
    risk: { highBg: 'rgba(244,67,54,0.2)', mediumBg: 'rgba(255,152,0,0.2)', lowBg: 'rgba(76,175,80,0.2)' },
    semantic: {
      success: pick(src.colors?.semantic?.success, '#10b981'),
      success_light: pick(src.colors?.semantic?.success_light, '#d1fae5'),
      warning: pick(src.colors?.semantic?.warning, '#f59e0b'),
      warning_light: pick(src.colors?.semantic?.warning_light, '#fef3c7'),
      error: pick(src.colors?.semantic?.error, '#ef4444'),
      error_light: pick(src.colors?.semantic?.error_light, '#fecaca'),
      info: pick(src.colors?.semantic?.info, '#2196f3'),
      info_light: pick(src.colors?.semantic?.info_light, '#e3f2fd'),
    },
    neutral: {
      50: pick(src.colors?.neutral?.['50'], '#f8fafc'),
      100: pick(src.colors?.neutral?.['100'], '#f1f5f9'),
      200: pick(src.colors?.neutral?.['200'], '#e2e8f0'),
      300: pick(src.colors?.neutral?.['300'], '#cbd5e1'),
      400: pick(src.colors?.neutral?.['400'], '#94a3b8'),
      500: pick(src.colors?.neutral?.['500'], '#64748b'),
      600: pick(src.colors?.neutral?.['600'], '#475569'),
      700: pick(src.colors?.neutral?.['700'], '#334155'),
      800: pick(src.colors?.neutral?.['800'], '#1e293b'),
      900: pick(src.colors?.neutral?.['900'], '#0f172a'),
    },
  },
  spacing: {
    xs: pick(src.spacing?.xs, '4px'),
    sm: pick(src.spacing?.sm, '8px'),
    md: pick(src.spacing?.md, '16px'),
    lg: pick(src.spacing?.lg, '24px'),
    xl: pick(src.spacing?.xl, '32px'),
    '2xl': pick(src.spacing?.['2xl'], '48px'),
    '3xl': pick(src.spacing?.['3xl'], '64px'),
    '4xl': pick(src.spacing?.['4xl'], '80px'),
    '5xl': pick(src.spacing?.['5xl'], '100px'),
  },
  typography: {
    fonts: {
      body: pick(src.typography?.fonts?.body, src.typography?.fontFamily, 'Roboto, sans-serif'),
      heading: pick(src.typography?.fonts?.heading, src.typography?.fontFamily, 'Greycliff, sans-serif'),
    },
    scales: {
      h1: pick(src.typography?.scales?.h1, { fontSize: '56px', fontWeight: 800, lineHeight: '64px', letterSpacing: '-0.02em' }),
      h2: pick(src.typography?.scales?.h2, { fontSize: '48px', fontWeight: 700, lineHeight: '56px', letterSpacing: '-0.01em' }),
      h3: pick(src.typography?.scales?.h3, { fontSize: '36px', fontWeight: 700, lineHeight: '44px', letterSpacing: '-0.01em' }),
      h4: pick(src.typography?.scales?.h4, { fontSize: '28px', fontWeight: 600, lineHeight: '36px', letterSpacing: '0' }),
      body: pick(src.typography?.scales?.body, { fontSize: '16px', fontWeight: 400, lineHeight: '26px', letterSpacing: '0' }),
      body_large: pick(src.typography?.scales?.body_large, { fontSize: '18px', fontWeight: 400, lineHeight: '28px', letterSpacing: '0' }),
      body_small: pick(src.typography?.scales?.body_small, { fontSize: '14px', fontWeight: 400, lineHeight: '22px', letterSpacing: '0' }),
      caption: pick(src.typography?.scales?.caption, { fontSize: '12px', fontWeight: 500, lineHeight: '18px', letterSpacing: '0.02em' }),
      button: pick(src.typography?.scales?.button, { fontSize: '14px', fontWeight: 600, letterSpacing: '0.01em' }),
    },
  },
  layout: {
    maxWidth: pick(src.layout?.maxWidth, src.layout?.containerMaxWidth?.xl, '1200px'),
    breakpoints: {
      mobile: pick(src.layout?.breakpoints?.mobile, src.layout?.breakpoints?.sm, '480px'),
      wide: pick(src.layout?.breakpoints?.wide, src.layout?.breakpoints?.xl, '1200px'),
    },
    container: { padding: pick(src.layout?.container?.padding, '0 20px'), margin: pick(src.layout?.container?.margin, '0 auto') },
    grid: { gap: pick(src.layout?.grid?.gap, '24px') },
  },
  effects: {
    transitions: pick(src.effects?.transitions, { fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)', normal: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', slow: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }),
    shadows: {
      xs: pick(src.effects?.shadows?.xs, '0 1px 2px rgba(0, 0, 0, 0.05)'),
      sm: pick(src.effects?.shadows?.sm, '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'),
      md: pick(src.effects?.shadows?.md, '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)'),
      lg: pick(src.effects?.shadows?.lg, '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'),
      xl: pick(src.effects?.shadows?.xl, '0 20px 25px rgba(0, 0, 0, 0.1), 0 8px 10px rgba(0, 0, 0, 0.04)'),
      card: pick(src.effects?.shadows?.card, '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)'),
      button: pick(src.effects?.shadows?.button, '0 2px 8px rgba(33, 150, 243, 0.24)'),
      modal: pick(src.effects?.shadows?.modal, '0 25px 50px rgba(0, 0, 0, 0.25)'),
    },
    focusRing: '0 0 0 3px rgba(33,150,243,0.25)',
  },
  components: {
    buttons: {
      primary: {
        backgroundColor: pick(src.components?.buttons?.primary?.backgroundColor, '#2196f3'),
        color: pick(src.components?.buttons?.primary?.color, '#ffffff'),
        border: pick(src.components?.buttons?.primary?.border, 'none'),
        padding: pick(src.components?.buttons?.primary?.padding, '12px 24px'),
        borderRadius: pick(src.components?.buttons?.primary?.borderRadius, '12px'),
        transition: pick(src.components?.buttons?.primary?.transition, 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'),
        cursor: pick(src.components?.buttons?.primary?.cursor, 'pointer'),
        boxShadow: pick(src.components?.buttons?.primary?.boxShadow, '0 2px 8px rgba(33, 150, 243, 0.24)'),
        fontWeight: pick(src.components?.buttons?.primary?.fontWeight, '600'),
      },
      secondary: {
        backgroundColor: pick(src.components?.buttons?.secondary?.backgroundColor, 'transparent'),
        color: pick(src.components?.buttons?.secondary?.color, '#2196f3'),
        border: pick(src.components?.buttons?.secondary?.border, '1.5px solid #2196f3'),
        padding: pick(src.components?.buttons?.secondary?.padding, '12px 24px'),
        borderRadius: pick(src.components?.buttons?.secondary?.borderRadius, '12px'),
        transition: pick(src.components?.buttons?.secondary?.transition, 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'),
        cursor: pick(src.components?.buttons?.secondary?.cursor, 'pointer'),
        fontWeight: pick(src.components?.buttons?.secondary?.fontWeight, '600'),
      },
      ghost: {
        backgroundColor: pick(src.components?.buttons?.ghost?.backgroundColor, 'transparent'),
        color: pick(src.components?.buttons?.ghost?.color, '#475569'),
        border: pick(src.components?.buttons?.ghost?.border, 'none'),
        padding: pick(src.components?.buttons?.ghost?.padding, '8px 16px'),
        borderRadius: pick(src.components?.buttons?.ghost?.borderRadius, '8px'),
        transition: pick(src.components?.buttons?.ghost?.transition, 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'),
        cursor: pick(src.components?.buttons?.ghost?.cursor, 'pointer'),
        fontWeight: pick(src.components?.buttons?.ghost?.fontWeight, '500'),
      },
    },
    cards: {
      default: {
        backgroundColor: pick(src.components?.cards?.default?.backgroundColor, '#ffffff'),
        borderRadius: pick(src.components?.cards?.default?.borderRadius, '16px'),
        padding: pick(src.components?.cards?.default?.padding, '24px'),
        border: pick(src.components?.cards?.default?.border, '1px solid #e2e8f0'),
        backdropFilter: pick(src.components?.cards?.default?.backdropFilter, 'none'),
      },
      elevated: {
        backgroundColor: pick(src.components?.cards?.elevated?.backgroundColor, '#ffffff'),
        borderRadius: pick(src.components?.cards?.elevated?.borderRadius, '20px'),
        padding: pick(src.components?.cards?.elevated?.padding, '32px'),
        boxShadow: pick(src.components?.cards?.elevated?.boxShadow, '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'),
      },
      testimonial: {
        backgroundColor: pick(src.components?.cards?.testimonial?.backgroundColor, '#f8fafc'),
        borderRadius: pick(src.components?.cards?.testimonial?.borderRadius, '16px'),
        padding: pick(src.components?.cards?.testimonial?.padding, '24px'),
        border: pick(src.components?.cards?.testimonial?.border, '1px solid #e2e8f0'),
      },
    },
    inputs: {
      default: {
        backgroundColor: pick(src.components?.inputs?.default?.backgroundColor, '#ffffff'),
        borderRadius: pick(src.components?.inputs?.default?.borderRadius, '12px'),
        padding: pick(src.components?.inputs?.default?.padding, '14px 16px'),
        border: pick(src.components?.inputs?.default?.border, '1.5px solid #e2e8f0'),
        fontSize: pick(src.components?.inputs?.default?.fontSize, '16px'),
        transition: pick(src.components?.inputs?.default?.transition, 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'),
        focusBorderColor: pick(src.components?.inputs?.default?.focusBorderColor, '#2196f3'),
        focusBoxShadow: pick(src.components?.inputs?.default?.focusBoxShadow, '0 0 0 3px rgba(33, 150, 243, 0.12)'),
      },
    },
    navigation: {
      height: pick(src.components?.navigation?.height, '80px'),
      backgroundColor: pick(src.components?.navigation?.backgroundColor, 'rgba(255, 255, 255, 0.95)'),
      backdropFilter: pick(src.components?.navigation?.backdropFilter, 'blur(20px)'),
      borderBottom: pick(src.components?.navigation?.borderBottom, '1px solid #e9ecef'),
      padding: pick(src.components?.navigation?.padding, '0 20px'),
    },
    sections: { footer: { borderTop: pick(src.components?.sections?.footer?.borderTop, '1px solid #e9ecef') } },
  },
};

export default tokens;


