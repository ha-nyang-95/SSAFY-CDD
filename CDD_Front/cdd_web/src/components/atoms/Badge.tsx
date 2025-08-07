
import React from 'react';
import styled, { css } from 'styled-components';

interface StyledBadgeProps {
  variant: 'high' | 'medium' | 'low';
}

const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px; /* Adjusted padding as per mockup */
  border-radius: ${(props) => props.theme.radii.medium}; /* Use theme radii */
  font-size: ${(props) => props.theme.fontSizes.small}; /* Use theme font size */
  font-weight: 700; /* Adjusted font weight as per mockup */
  color: ${(props) => props.theme.colors.surface}; /* Use theme surface color for text */

  ${(props) =>
    props.variant === 'high' &&
    css`
      background-color: ${(props) => props.theme.colors.danger};
    `}

  ${(props) =>
    props.variant === 'medium' &&
    css`
      background-color: ${(props) => props.theme.colors.warning};
    `}

  ${(props) =>
    props.variant === 'low' &&
    css`
      background-color: ${(props) => props.theme.colors.info};
    `}
`;

interface BadgeProps {
  variant: 'high' | 'medium' | 'low';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return <StyledBadge variant={variant}>{children}</StyledBadge>;
};

export default Badge;
