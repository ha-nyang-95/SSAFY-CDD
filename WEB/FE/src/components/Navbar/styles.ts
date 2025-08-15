import styled from '@emotion/styled';

export const Bar = styled.nav((p) => ({
  height: p.theme.components.navigation.height,
  backgroundColor: p.theme.components.navigation.backgroundColor,
  backdropFilter: p.theme.components.navigation.backdropFilter,
  borderBottom: p.theme.components.navigation.borderBottom,
  padding: p.theme.components.navigation.padding,
  display: 'flex',
  alignItems: 'center',
}));

export const Inner = styled.div((p) => ({
  maxWidth: p.theme.layout.maxWidth,
  margin: p.theme.layout.container.margin,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: p.theme.spacing.lg,
}));

export const Logo = styled.div((p) => ({
  display: 'flex',
  alignItems: 'center',
  gap: p.theme.spacing.sm,
  fontWeight: 800,
  fontSize: `calc(${p.theme.components.navigation.height} * 0.8)`,
  lineHeight: p.theme.components.navigation.height,
}));

export const Links = styled.ul((p) => ({
  listStyle: 'none',
  display: 'flex',
  gap: p.theme.spacing.lg,
  margin: 0,
  padding: 0,
  a: {
    color: p.theme.colors.primary.text_secondary,
    fontSize: `calc(${p.theme.components.navigation.height} * 0.5)`,
    lineHeight: p.theme.components.navigation.height,
  },
}));

export const MenuToggle = styled.button((p) => ({
  display: 'none',
  background: 'transparent',
  border: `1px solid ${p.theme.colors.secondary.hover}`,
  color: p.theme.colors.primary.text_primary,
  padding: `${p.theme.spacing.xs} ${p.theme.spacing.sm}`,
  borderRadius: p.theme.components.buttons.primary.borderRadius,
  cursor: 'pointer',
  '@media (max-width: 768px)': {
    display: 'block',
  },
}));


