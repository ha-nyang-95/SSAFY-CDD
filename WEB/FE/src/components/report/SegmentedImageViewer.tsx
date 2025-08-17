import styled from '@emotion/styled';

type Props = { src: string; onClick?: () => void };

const Frame = styled.div((p) => ({
  backgroundColor: p.theme.colors.secondary.medium,
  borderRadius: p.theme.components.cards.default.borderRadius,
  overflow: 'hidden',
}));

export default function SegmentedImageViewer({ src, onClick }: Props) {
  return (
    <Frame>
      <img
        src={src}
        alt="세그먼트 결과"
        style={{ width: '100%', height: 'auto', display: 'block', cursor: onClick ? 'pointer' as const : 'default' }}
        onClick={onClick}
      />
    </Frame>
  );
}


