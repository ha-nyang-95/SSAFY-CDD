import type { HTMLAttributes } from 'react';
import { Body, Image, Subtitle, Title, Wrap } from './styles';

export interface ImageCardProps extends HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export function ImageCard({ imageUrl, title, subtitle, ...rest }: ImageCardProps) {
  return (
    <Wrap {...rest}>
      <Image src={imageUrl} alt={title ?? 'image card'} />
      <Body>
        {title ? <Title>{title}</Title> : null}
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      </Body>
    </Wrap>
  );
}

export default ImageCard;


