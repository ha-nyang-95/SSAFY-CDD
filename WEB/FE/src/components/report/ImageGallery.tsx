import styled from '@emotion/styled';
import { useMemo } from 'react';

type Props = { images: string[] };

const Grid = styled.div((p) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: p.theme.spacing.md,
}));

const Item = styled.div((p) => ({
  backgroundColor: p.theme.colors.secondary.medium,
  borderRadius: p.theme.components.cards.default.borderRadius,
  overflow: 'hidden',
}));

export default function ImageGallery({ images }: Props) {
  // 한국어 주석: CORS/XHR 문제를 피하기 위해 fetch로 Blob 변환하지 않고, 브라우저의 기본 이미지 로딩을 사용합니다.
  const safeImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);

  return (
    <Grid>
      {safeImages.map((src, idx) => (
        <Item key={`${idx}-${src}`}>
          <img
            src={src}
            alt={`점검 이미지 ${idx + 1}`}
            crossOrigin="anonymous"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={(e) => {
              // 한국어 주석: 이미지 로드 실패 시 요소를 숨겨 UX 저하를 방지합니다.
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
        </Item>
      ))}
    </Grid>
  );
}


