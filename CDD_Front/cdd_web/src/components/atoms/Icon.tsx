
import React from 'react';
import styled, { css } from 'styled-components';

// Design Tokens (from README.md - simplified for direct use in component)
const colors = {
  primary: '#0A3D62', // Deep Blue
  accent: '#0984E3', // Bright Blue
  darkGray: '#747D8C', // Dark Gray
  white: '#FFFFFF',
};

interface StyledIconProps {
  size: string;
  $iconColor: string;
}

const StyledIcon = styled.svg<StyledIconProps>`
  display: inline-block;
  vertical-align: middle;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  fill: ${(props) => props.$iconColor};
  flex-shrink: 0; // Prevent shrinking in flex containers
`;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: 'video' | '3d-model' | 'structure';
  size?: string;
  color?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = '24px', // Default size
  color = colors.darkGray, // Default color
  ...rest
}) => {
  const getIconPath = () => {
    switch (name) {
      case 'video':
        return (
          <path d="M18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4ZM10 16.5V7.5L16 12L10 16.5Z" />
        ); // Simple video icon (play button in a square)
      case '3d-model':
        return (
          <path d="M12 3L1 9L12 15L23 9L12 3ZM1 15L12 21L23 15V9L12 15L1 9V15Z" />
        ); // Simple 3D cube icon
      case 'structure':
        return (
          <path d="M21 10H18V7H15V10H12V7H9V10H6V7H3V10H0V24H24V10H21ZM22 22H2V12H22V22Z" />
        ); // Simple building/structure icon
      default:
        return null;
    }
  };

  return (
    <StyledIcon
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      size={size}
      $iconColor={color}
      {...rest}
    >
      {getIconPath()}
    </StyledIcon>
  );
};

export default Icon;
