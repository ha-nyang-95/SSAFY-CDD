import Button from '../Button';
import { CtaWrapper, Inner, Subtitle, Title, Wrap } from './styles';

export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export function Hero({ title, subtitle, ctaLabel = 'Get Started', onCtaClick }: HeroProps) {
  return (
    <Wrap>
      <Inner>
        <Title>{title}</Title>
        {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
        <CtaWrapper>
          <Button onClick={onCtaClick}>{ctaLabel}</Button>
        </CtaWrapper>
      </Inner>
    </Wrap>
  );
}

export default Hero;


