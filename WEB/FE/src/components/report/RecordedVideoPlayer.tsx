import styled from '@emotion/styled';

type Props = { src: string };

const Frame = styled.div((p) => ({
  backgroundColor: p.theme.colors.secondary.medium,
  borderRadius: p.theme.components.cards.default.borderRadius,
  overflow: 'hidden',
}));

export default function RecordedVideoPlayer({ src }: Props) {
  // 빈 URL은 안내 문구 표시
  const isEmpty = !src || src.trim().length === 0;
  const handleError = () => {
    const el = document.getElementById('video-fallback');
    if (el) el.textContent = '영상을 불러오지 못했습니다.';
  };

  return (
    <Frame className="no-print">
      {isEmpty ? (
        <div style={{ padding: 12 }}>영상이 없습니다.</div>
      ) : (
        <>
          <video
            src={src}
            controls
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
            onError={handleError}
            style={{ width: '100%', display: 'block' }}
          />
          <div id="video-fallback" style={{ padding: 12 }} />
        </>
      )}
    </Frame>
  );
}


