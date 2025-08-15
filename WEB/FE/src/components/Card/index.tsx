import type { HTMLAttributes, ReactNode } from 'react';
import { Body, Description, Image, StyledCard } from './styles';

export type CardVariant = 'default' | 'testimonial';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children?: ReactNode;
  imageUrl?: string;
  title?: string;
  description?: string;
}

export function Card({ variant = 'default', imageUrl, title, description, children, ...rest }: CardProps) {
  const hasImage = typeof imageUrl === 'string' && imageUrl.length > 0;
  const hasTitle = typeof title === 'string' && title.length > 0;
  const hasDescription = typeof description === 'string' && description.length > 0;

  return (
    <StyledCard variant={variant} {...rest}>
      {hasImage ? <Image src={imageUrl} alt={title ?? 'card image'} /> : null}
      <Body>
        {hasTitle ? <h3 style={{ margin: 0 }}>{title}</h3> : null}
        {hasDescription ? <Description>{description}</Description> : children}
      </Body>
    </StyledCard>
  );
}

export default Card;


