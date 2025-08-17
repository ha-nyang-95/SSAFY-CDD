import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { StyledButton } from './styles';

// 한국어 주석: 버튼 컴포넌트 공개 타입과 기본 API
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, isLoading, children, disabled, ...rest },
  ref,
) {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? 'Loading…' : children}
    </StyledButton>
  );
});

export default Button;


