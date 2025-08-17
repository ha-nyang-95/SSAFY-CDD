import styled from '@emotion/styled';

export const Wrap = styled.div((p) => ({
  background: p.theme.components.cards.default.backgroundColor,
  border: p.theme.components.cards.default.border,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.spacing.lg,
  boxShadow: p.theme.effects.shadows.card,
}));

export const Subtitle = styled.p((p) => ({
  color: p.theme.colors.primary.text_secondary,
  margin: 0,
  marginTop: p.theme.spacing.xs,
}));

export const Content = styled.div((p) => ({
  marginTop: p.theme.spacing.sm,
}));


