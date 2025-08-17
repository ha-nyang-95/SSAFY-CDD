import { Children, useEffect, useMemo, useState } from 'react';
import Button from '../Button';
import type { ReactElement, ReactNode } from 'react';
import { Arrows, Dot, Indicators, Slide, Track, Wrapper } from './styles';

export interface CarouselProps {
  children: ReactNode;
  initialIndex?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  autoPlayMs?: number | null;
}

export function Carousel({
  children,
  initialIndex = 0,
  showIndicators = true,
  showArrows = true,
  loop = true,
  autoPlayMs = null,
}: CarouselProps): ReactElement {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const [index, setIndex] = useState(Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)));

  const goPrev = () => {
    setIndex((i) => {
      if (i === 0) return loop ? slides.length - 1 : 0;
      return i - 1;
    });
  };

  const goNext = () => {
    setIndex((i) => {
      if (i === slides.length - 1) return loop ? 0 : i;
      return i + 1;
    });
  };

  const goTo = (i: number) => setIndex(i);

  // 자동재생
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!autoPlayMs || slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i === slides.length - 1 ? (loop ? 0 : i) : i + 1));
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, slides.length, loop]);

  return (
    <Wrapper>
      <Track index={index}>
        {slides.map((node, i) => (
          <Slide key={i}>{node}</Slide>
        ))}
      </Track>
      {showArrows && slides.length > 1 && (
        <Arrows>
          <Button variant="secondary" onClick={goPrev} aria-label="Previous" style={{ borderRadius: '50%' }}>
            ◀
          </Button>
          <Button variant="secondary" onClick={goNext} aria-label="Next" style={{ borderRadius: '50%' }}>
            ▶
          </Button>
        </Arrows>
      )}
      {showIndicators && slides.length > 1 && (
        <Indicators>
          {slides.map((_, i) => (
            <Dot key={i} active={i === index} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </Indicators>
      )}
    </Wrapper>
  );
}

export default Carousel;


