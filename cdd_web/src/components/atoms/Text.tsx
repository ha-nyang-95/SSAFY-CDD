
import React from 'react';
import styled, { css } from 'styled-components';

interface StyledTextProps {
  $color?: string;
  $fontSize?: string;
  $fontWeight?: string;
}

const StyledText = styled.p<StyledTextProps>`
  margin: 0;
  padding: 0;
  color: ${(props) => props.$color || 'inherit'}; 
  font-size: ${(props) => props.theme.fontSizes.medium}; /* Use theme medium as default */
  font-weight: ${(props) => props.$fontWeight || 'normal'};

  ${(props) =>
    props.as === 'h1' &&
    css`
      font-size: ${(props) => props.theme.fontSizes.xLarge};
      font-weight: 700;
    `}

  ${(props) =>
    props.as === 'h2' &&
    css`
      font-size: ${(props) => props.theme.fontSizes.large};
      font-weight: 700;
    `}

  ${(props) =>
    props.as === 'h3' &&
    css`
      font-size: 1.1rem; /* Specific size from mockup */
      font-weight: 700;
    `}

  ${(props) =>
    props.as === 'strong' &&
    css`
      font-weight: 700;
    `}
`;

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'strong';
  color?: string; // Allow custom color override
  fontSize?: string; // Allow custom font size override
  fontWeight?: string;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  variant = 'p',
  color,
  fontSize,
  fontWeight,
  children,
  ...rest
}) => {
  return (
    <StyledText
      as={variant}
      $color={color}
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      {...rest}
    >
      {children}
    </StyledText>
  );
};

export default Text;
