import type { HTMLAttributes } from 'react';
import { StyledContainer } from './styles';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  fluid?: boolean;
}

export const Container = StyledContainer;

export default Container;


