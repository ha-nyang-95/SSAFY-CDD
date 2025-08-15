import type { HTMLAttributes } from 'react';
import { StyledSection } from './styles';

export type SectionVariant = 'hero' | 'content' | 'footer';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
}

export const Section = StyledSection;

export default Section;


