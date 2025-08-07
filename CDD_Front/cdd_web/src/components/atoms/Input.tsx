
import React from 'react';
import styled, { css } from 'styled-components';

interface StyledInputProps {
  readOnly?: boolean;
  $hasError?: boolean;
  $variant: 'default' | 'auth';
}

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  padding: 12px; /* Adjusted padding as per mockup */
  border: 1px solid ${(props) => props.theme.colors.border}; /* Use theme border color */
  border-radius: ${(props) => props.theme.radii.small}; /* Use theme radii */
  font-size: 1rem;
  color: ${(props) => props.theme.colors.textPrimary}; /* Use theme text primary color */
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  font-family: ${(props) => props.theme.fonts.body};
  font-size: 1rem;

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary}; /* Use theme text secondary color */
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary}; /* Use theme primary color */
    box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.2);
  }

  ${(props) =>
    props.readOnly &&
    css`
      background-color: ${(props) => props.theme.colors.background}; /* Use theme background color */
      cursor: not-allowed;
    `}

  ${(props) =>
    props.$hasError &&
    css`
      border-color: ${(props) => props.theme.colors.danger}; /* Use theme danger color */
      &:focus {
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
      }
    `}

  ${(props) =>
    props.$variant === 'default' &&
    css`
      padding: 12px;
    `}
  
  ${(props) =>
    props.$variant === 'auth' &&
    css`
      padding: 14px; /* 인증 폼에서 사용되던 더 큰 padding */
    `}
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  $variant?: 'default' | 'auth';
  $hasError?: boolean;
}

const Input: React.FC<InputProps> = ({
  $variant = 'default',
  $hasError = false,
  ...rest
}) => {
  return (
    <StyledInput
      $variant={$variant}
      $hasError={$hasError}
      {...rest}
    />
  );
};

export default Input;
