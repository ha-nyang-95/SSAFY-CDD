import styled from '@emotion/styled';

// 한국어 주석: 공통 인풋 스타일 - 테마 토큰만 사용하도록 분리
export const StyledInput = styled.input((p) => ({
  width: '100%',
  padding: p.theme.components.inputs.default.padding,
  backgroundColor: p.theme.components.inputs.default.backgroundColor,
  color: p.theme.colors.primary.text_primary,
  border: p.theme.components.inputs.default.border,
  borderRadius: p.theme.components.inputs.default.borderRadius,
  fontSize: p.theme.components.inputs.default.fontSize,
  outline: 'none',
  transition: p.theme.components.inputs.default.transition,
  fontFamily: p.theme.typography.fonts.body,
  lineHeight: 1.5,
  '::placeholder': {
    color: p.theme.colors.primary.text_muted,
  },
  ':focus': {
    borderColor: p.theme.components.inputs.default.focusBorderColor,
    boxShadow: p.theme.components.inputs.default.focusBoxShadow,
  },
  ':hover:not(:focus)': {
    borderColor: p.theme.colors.neutral[300],
  },
  ':disabled': {
    backgroundColor: p.theme.colors.neutral[50],
    color: p.theme.colors.primary.text_muted,
    cursor: 'not-allowed',
  },
}));


