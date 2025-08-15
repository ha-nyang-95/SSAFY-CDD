import styled from '@emotion/styled';

// S3의 GLB/GLTF 모델을 <model-viewer>로 표시하는 간단한 뷰어
type Props = { src: string };

const Box = styled.div((p) => ({
  width: '100%',
  aspectRatio: '16/9',
  background: p.theme.colors.gradients.card,
  border: p.theme.components.cards.default.border,
  borderRadius: p.theme.components.cards.default.borderRadius,
  overflow: 'hidden',
}));

export default function ModelViewer3D({ src }: Props) {
  const hasSrc = !!src && src.trim().length > 0;
  return (
    <Box>
      {hasSrc ? (
        // @ts-expect-error model-viewer 웹 컴포넌트 사용
        <model-viewer
          src={src}
          camera-controls
          ar
          autoplay
          style={{ width: '100%', height: '100%', display: 'block' }}
          exposure="0.9"
          shadow-intensity="0.8"
          touch-action="pan-y"
        />
      ) : (
        <div style={{ padding: 16 }}>모델 URL이 없습니다.</div>
      )}
    </Box>
  );
}


