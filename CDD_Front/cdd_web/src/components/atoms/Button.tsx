
import React from 'react';
import styled, { css } from 'styled-components';

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'danger' | 'nav' | 'auth' | 'switch-auth' | 'header';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: ${(props) => props.theme.radii.medium}; // 디자인 일관성을 위해 small -> medium으로 변경
  transition: all 0.2s ease-in-out;
  
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 700;
  border: 1px solid transparent; // 모든 버튼에 투명한 border를 기본으로 주어 hover시 레이아웃 밀림 방지

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.4);
  }

  ${(props) =>
    props.size === 'sm' &&
    css`
      padding: 8px 16px;
      font-size: ${({ theme }) => theme.fontSizes.small};
    `}
  ${(props) =>
    props.size === 'md' &&
    css`
      padding: 10px 20px;
      font-size: ${({ theme }) => theme.fontSizes.medium};
    `}
  ${(props) =>
    props.size === 'lg' &&
    css`
      padding: 12px 24px;
      font-size: ${({ theme }) => theme.fontSizes.large};
    `}

  ${(props) =>
    (props.$variant === 'primary' || props.$variant === 'auth') &&
    css`
      background-color: ${props.theme.colors.accent};
      color: ${props.theme.colors.background}; // White text
      
      &:hover:not(:disabled) {
        /* 테마의 기본 색상(Deep Blue)을 호버 색상으로 사용하여 일관성 유지 */
        background-color: ${props.theme.colors.primary};
      }
    `}

  ${(props) =>
    props.$variant === 'secondary' &&
    css`
      background-color: ${props.theme.colors.surface};
      color: ${props.theme.colors.textPrimary};
      border-color: ${props.theme.colors.border};

      &:hover:not(:disabled) {
        background-color: ${props.theme.colors.border};
      }
    `}

  ${(props) =>
    props.$variant === 'danger' &&
    css`
      background-color: ${props.theme.colors.danger};
      color: ${props.theme.colors.background}; // White text

      &:hover:not(:disabled) {
        filter: brightness(0.9);
      }
    `}

  ${(props) =>
    props.$variant === 'nav' &&
    css`
      background-color: transparent;
      border: none;
      color: ${(props) => props.theme.colors.surface};
      opacity: 0.8;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      border-radius: ${(props) => props.theme.radii.small};
      width: 100%;
      font-size: ${(props) => props.theme.fontSizes.small};
      font-weight: 500;
      
      &:hover:not(:disabled), &.active { /* Added active state */
        background-color: rgba(255, 255, 255, 0.2);
        opacity: 1;
      }
    `}

  ${(props) =>
    props.$variant === 'switch-auth' &&
    css`
      background-color: transparent;
      color: ${props.theme.colors.accent};
      text-decoration: underline;
      font-weight: 500;
      
      &:hover:not(:disabled) {
        color: ${props.theme.colors.primary};
      }
    `}

  ${(props) =>
    props.$variant === 'header' &&
    css`
      background-color: transparent;
      border: 1px solid ${(props) => props.theme.colors.border};
      color: ${(props) => props.theme.colors.textSecondary};
      padding: 12px 24px;
      font-size: ${(props) => props.theme.fontSizes.medium};
      border-radius: ${(props) => props.theme.radii.small};
      font-weight: 500;

      &:hover:not(:disabled) {
        background-color: ${(props) => props.theme.colors.background};
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: 'primary' | 'secondary' | 'danger' | 'nav' | 'auth' | 'switch-auth' | 'header';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  $variant = 'primary',
  size = 'md',
  children,
  ...rest
}) => {
  return (
    <StyledButton
      $variant={$variant}
      size={size}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
