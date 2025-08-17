import styled from '@emotion/styled';

export const Wrapper = styled.div((p) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: p.theme.components.cards.default.borderRadius,
  border: p.theme.components.cards.default.border,
  backgroundColor: p.theme.components.cards.default.backgroundColor,
}));

export const Track = styled.div<{ index: number }>((p) => ({
  display: 'flex',
  transition: `transform ${p.theme.effects.transitions.normal}`,
  transform: `translateX(-${p.index * 100}%)`,
}));

export const Slide = styled.div((p) => ({
  flex: '0 0 100%',
  padding: p.theme.spacing.lg,
}));

export const Arrows = styled.div((p) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `0 ${p.theme.spacing.md}`,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  button: { pointerEvents: 'auto' },
}));

export const Indicators = styled.div((p) => ({
  position: 'absolute',
  bottom: p.theme.spacing.md,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: p.theme.spacing.sm,
}));

export const Dot = styled.button<{ active: boolean }>((p) => ({
  width: p.theme.icons.size.small,
  height: p.theme.icons.size.small,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: p.active
    ? p.theme.colors.primary.accent
    : p.theme.colors.primary.text_muted,
  cursor: 'pointer',
  padding: 0,
}));


