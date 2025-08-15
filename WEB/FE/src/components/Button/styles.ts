import styled from '@emotion/styled';
import type { CSSObject, Theme } from '@emotion/react';
import type { ButtonSize, ButtonVariant } from './index';

// 한국어 주석: 사이즈별 스타일 맵 - 테마 토큰 기반
const sizeStyles: Record<ButtonSize, (p: { theme: Theme }) => CSSObject> = {
  sm: (p) => ({
    padding: `${p.theme.spacing.sm} ${p.theme.spacing.md}`,
    fontSize: p.theme.typography.scales.body_small.fontSize,
    fontWeight: p.theme.typography.scales.button.fontWeight,
  }),
  md: (p) => ({
    padding: p.theme.components.buttons.primary.padding,
    fontSize: p.theme.typography.scales.button.fontSize,
    fontWeight: p.theme.typography.scales.button.fontWeight,
  }),
  lg: (p) => ({
    padding: `${p.theme.spacing.md} ${p.theme.spacing.xl}`,
    fontSize: p.theme.typography.scales.body.fontSize,
    fontWeight: p.theme.typography.scales.button.fontWeight,
  }),
};

// 한국어 주석: 배리언트별 스타일 맵 - 테마 토큰 기반
const variantStyles: Record<ButtonVariant, (p: { theme: Theme }) => CSSObject> = {
  primary: (p) => ({
    backgroundColor: p.theme.components.buttons.primary.backgroundColor,
    color: p.theme.components.buttons.primary.color,
    border: p.theme.components.buttons.primary.border,
    borderRadius: p.theme.components.buttons.primary.borderRadius,
    fontWeight: p.theme.components.buttons.primary.fontWeight,
    transition: p.theme.components.buttons.primary.transition,
    cursor: p.theme.components.buttons.primary.cursor,
    boxShadow: p.theme.components.buttons.primary.boxShadow,
    fontFamily: p.theme.typography.fonts.body,
    '&:hover:not(:disabled)': {
      backgroundColor: p.theme.colors.primary.accent_dark,
      transform: 'translateY(-1px)',
      boxShadow: p.theme.effects.shadows.lg,
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: p.theme.effects.shadows.sm,
    },
    '&:disabled': {
      backgroundColor: p.theme.colors.neutral[300],
      color: p.theme.colors.neutral[500],
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  }),
  secondary: (p) => ({
    backgroundColor: p.theme.components.buttons.secondary.backgroundColor,
    color: p.theme.components.buttons.secondary.color,
    border: p.theme.components.buttons.secondary.border,
    borderRadius: p.theme.components.buttons.secondary.borderRadius,
    fontWeight: p.theme.components.buttons.secondary.fontWeight,
    transition: p.theme.components.buttons.secondary.transition,
    cursor: p.theme.components.buttons.secondary.cursor,
    fontFamily: p.theme.typography.fonts.body,
    '&:hover:not(:disabled)': {
      backgroundColor: p.theme.colors.secondary.hover,
      borderColor: p.theme.colors.primary.accent_dark,
      color: p.theme.colors.primary.accent_dark,
    },
    '&:active': {
      backgroundColor: p.theme.colors.secondary.active,
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      borderColor: p.theme.colors.neutral[300],
      color: p.theme.colors.neutral[400],
      cursor: 'not-allowed',
    },
  }),
  ghost: (p) => {
    const ghost = p.theme.components.buttons.ghost ?? p.theme.components.buttons.secondary;
    return {
      backgroundColor: ghost.backgroundColor,
      color: ghost.color,
      border: ghost.border,
      borderRadius: ghost.borderRadius ?? p.theme.components.buttons.secondary.borderRadius,
      fontWeight: ghost.fontWeight ?? p.theme.components.buttons.secondary.fontWeight,
      transition: ghost.transition ?? p.theme.components.buttons.secondary.transition,
      cursor: ghost.cursor ?? p.theme.components.buttons.secondary.cursor,
      fontFamily: p.theme.typography.fonts.body,
      '&:hover:not(:disabled)': {
        backgroundColor: p.theme.colors.secondary.hover,
        color: p.theme.colors.primary.accent,
      },
      '&:active': {
        backgroundColor: p.theme.colors.secondary.active,
      },
      '&:disabled': {
        color: p.theme.colors.neutral[400],
        cursor: 'not-allowed',
      },
    } as CSSObject;
  },
};

export const StyledButton = styled.button<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
}>(
  (p) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: p.theme.spacing.sm,
    lineHeight: 1,
    width: p.fullWidth ? '100%' : undefined,
  }),
  (p) => sizeStyles[p.size](p),
  (p) => variantStyles[p.variant](p),
);


