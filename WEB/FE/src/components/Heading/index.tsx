import type { HTMLAttributes } from 'react';
import { H } from './styles';

export type HeadingLevel = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

export function Heading({ level = 1, ...rest }: HeadingProps) {
  return <H as={`h${level}` as any} level={level} {...rest} />;
}

export default Heading;


