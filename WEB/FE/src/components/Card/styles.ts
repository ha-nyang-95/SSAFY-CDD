import styled from '@emotion/styled';
import type { CSSObject, Theme } from '@emotion/react';
import type { CardVariant, CardProps } from './index';

// 한국어 주석: 카드 배리언트별 스타일 맵
export const variantStyles: Record<CardVariant, (p: { theme: Theme }) => CSSObject> = {
  default: (p) => ({
    backgroundColor: p.theme.components.cards.default.backgroundColor,
    borderRadius: p.theme.components.cards.default.borderRadius,
    padding: p.theme.components.cards.default.padding,
    border: p.theme.components.cards.default.border,
    backdropFilter: p.theme.components.cards.default.backdropFilter,
    boxShadow: p.theme.effects.shadows.card,
  }),
  testimonial: (p) => ({
    backgroundColor: p.theme.components.cards.testimonial.backgroundColor,
    borderRadius: p.theme.components.cards.testimonial.borderRadius,
    padding: p.theme.components.cards.testimonial.padding,
    border: p.theme.components.cards.testimonial.border,
  }),
};

export const StyledCard = styled.div<Required<Pick<CardProps, 'variant'>>>(
  (p) => ({
    color: p.theme.colors.primary.text_primary,
  }),
  (p) => variantStyles[p.variant](p),
);

export const Image = styled.img((p) => ({
  width: '100%',
  height: 'auto',
  display: 'block',
  borderTopLeftRadius: p.theme.components.cards.default.borderRadius,
  borderTopRightRadius: p.theme.components.cards.default.borderRadius,
}));

export const Body = styled.div((p) => ({
  paddingTop: p.theme.spacing.md,
}));

export const Description = styled.p((p) => ({
  marginTop: p.theme.spacing.sm,
  color: p.theme.colors.primary.text_secondary,
  margin: 0,
  marginTop: p.theme.spacing.sm,
}));


