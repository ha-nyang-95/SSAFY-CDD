import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { StyledInput } from './styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return <StyledInput ref={ref} {...props} />;
});

export default Input;


