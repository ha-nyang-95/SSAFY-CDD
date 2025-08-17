import styled from '@emotion/styled';

const mapStylesByStatus = (p: any, status: string) => {
  switch (status) {
    case 'scheduled':
      return {
        background: p.theme.colors.neutral[100],
        color: p.theme.colors.primary.text_secondary,
        border: `1px solid ${p.theme.colors.neutral[200]}`,
      };
    case 'running':
      return {
        background: p.theme.colors.semantic.info_light,
        color: p.theme.colors.semantic.info,
        border: `1px solid ${p.theme.colors.semantic.info}`,
      };
    case 'completed':
      return {
        background: p.theme.colors.semantic.success_light,
        color: p.theme.colors.semantic.success,
        border: `1px solid ${p.theme.colors.semantic.success}`,
      };
    case 'error':
      return {
        background: p.theme.colors.semantic.error_light,
        color: p.theme.colors.semantic.error,
        border: `1px solid ${p.theme.colors.semantic.error}`,
      };
    default:
      return {};
  }
};

export const StyledBadge = styled.span((p) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `${p.theme.spacing.sm} ${p.theme.spacing.md}`,
  borderRadius: '9999px',
  fontSize: p.theme.typography.scales.caption.fontSize,
  fontWeight: 600,
  transition: p.theme.effects.transitions.normal,
  ...mapStylesByStatus(p, (p as any)["data-status"]),
}));


