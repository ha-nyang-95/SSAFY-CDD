import styled from '@emotion/styled';

type Props = { src: string };

const Box = styled.div((p) => ({
  width: '100%',
  aspectRatio: '16/9',
  background: p.theme.colors.primary.background,
  border: p.theme.components.cards.default.border,
  borderRadius: p.theme.components.cards.default.borderRadius,
  overflow: 'hidden',
}));

export default function SplatViewer({ src }: Props) {
  const viewerBase =
    (import.meta.env.VITE_SPLAT_VIEWER_BASE as string | undefined) ?? 'https://antimatter15.com/splat/';

  const hasSrc = !!src && src.trim().length > 0;

  const buildUrl = (modelUrl: string): string => {
    const u = new URL(viewerBase);
    // 일부 뷰어는 경로 뒤에 쿼리를 붙이고, 일부는 index.html? 형태를 요구 → 둘 다 수용
    const search = new URLSearchParams();
    search.set('model', modelUrl);
    search.set('url', modelUrl);
    search.set('src', modelUrl);
    search.set('exposure', '0');
    search.set('scale', '1');
    search.set('msaa', '1');
    search.set('culling', '1');
    // viewerBase가 이미 쿼리를 포함하지 않으면 그대로 붙임
    u.search = search.toString();
    return u.toString();
  };

  return (
    <Box>
      {hasSrc ? (
        <iframe
          src={buildUrl(src)}
          title="Gaussian Splat Viewer"
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          allow="fullscreen"
        />
      ) : (
        <div style={{ padding: 16 }}>모델 URL이 없습니다.</div>
      )}
    </Box>
  );
}


