import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getLiveEventsBySessionId, getLiveStreamUrl } from '../../../api';
import type { LiveEventItem } from '../../../api';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

const Grid = styled.div((p) => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: p.theme.spacing.lg,
  alignItems: 'start',
}));

const Panel = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.components.cards.default.padding,
  border: p.theme.components.cards.default.border,
  backdropFilter: p.theme.components.cards.default.backdropFilter,
}));

const Title = styled.h2((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h3.fontSize,
  fontWeight: p.theme.typography.scales.h3.fontWeight,
  color: p.theme.colors.primary.text_primary,
  marginTop: 0,
}));

const EventItem = styled.li((p) => ({
  listStyle: 'none',
  padding: `${p.theme.spacing.md} 0`,
  borderBottom: `1px solid ${p.theme.colors.neutral[100]}`,
  color: p.theme.colors.primary.text_secondary,
  fontSize: p.theme.typography.scales.body_small.fontSize,
  lineHeight: p.theme.typography.scales.body_small.lineHeight,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

// VLC 안내 영역에서 버튼 묶음을 위한 행 레이아웃
const ActionsRow = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.md,
  alignItems: 'center',
}));

// 보조 설명 텍스트 스타일 (테마 색상 사용)
const NoteText = styled.p((p) => ({
  color: p.theme.colors.primary.text_secondary,
}));

export default function LiveInspectionPage() {
  const { id } = useParams(); // id = sessionId
  const [searchParams] = useSearchParams();
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  // RTSP 스킴 여부 판별: 브라우저 직접 재생 불가 → VLC 안내로 분기
  const isRtsp = /^rtsps?:\/\//i.test(streamUrl);
  // MediaMTX WebRTC 내장 뷰어 주소 여부(포트 8889/9890 또는 확장자 없는 live_h264 경로 등 휴리스틱)
  const isWebRtcViewer = (() => {
    try {
      const u = new URL(streamUrl);
      if (u.protocol.startsWith('http')) {
        if (u.port === '8889' || u.port === '9890') return true;
        if (/\/live_h264\/?$/i.test(u.pathname) && !/\.m3u8$/i.test(u.pathname)) return true;
      }
    } catch {}
    return false;
  })();
  // HLS 매니페스트(.m3u8) 여부 (현재는 안내/디버깅용으로만 사용 예정)
  // 사용자가 VLC로 열고자 하는 커스텀 URL 입력값 (기본값은 API/쿼리/ENV 중 결정된 값 또는 안내용 예시)
  const [customUrl, setCustomUrl] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    // 우선순위: URL 파라미터(rtsp) > API 반환값 > 환경변수(VITE_RTSP_URL)
    const webrtcFromQuery = searchParams.get('webrtc');
    const hlsFromQuery = searchParams.get('hls');
    const rtspFromQuery = searchParams.get('rtsp');
    if (webrtcFromQuery) {
      setStreamUrl(webrtcFromQuery);
    } else if (hlsFromQuery) {
      setStreamUrl(hlsFromQuery);
    } else if (rtspFromQuery) {
      setStreamUrl(rtspFromQuery);
    } else {
      getLiveStreamUrl(id).then((url) => {
        if (url && url.trim()) {
          setStreamUrl(url);
        } else {
          // 환경변수 폴백: WebRTC > HLS > RTSP 순
          // 환경 변수 명 혼동 대비(VITE_WEBRTCURL / VITE_HLSURL도 지원)
          const envWebrtc = (import.meta.env.VITE_WEBRTC_URL as string | undefined)
            || (import.meta.env.VITE_WEBRTCURL as string | undefined)
            || '';
          const envHls = (import.meta.env.VITE_HLS_URL as string | undefined)
            || (import.meta.env.VITE_HLSURL as string | undefined)
            || '';
          const envRtsp = (import.meta.env.VITE_RTSP_URL as string | undefined) ?? '';
          const picked = envWebrtc || envHls || envRtsp;
          if (picked) setStreamUrl(picked);
        }
      });
    }
    getLiveEventsBySessionId(id).then(setEvents);
  }, [id, searchParams]);

  useEffect(() => {
    // 기본 입력값 초기화: streamUrl 존재하면 우선 적용, 없으면 예시 주소 세팅
    const example = 'http://13.209.97.113:9880/live_h264/index.m3u8';
    setCustomUrl((prev) => (prev ? prev : (streamUrl && streamUrl.trim()) ? streamUrl : example));
  }, [streamUrl]);

  return (
    <Grid>
      <Panel>
        <Title>라이브 스트림</Title>
        {!streamUrl ? (
          <p>스트림을 불러오는 중…</p>
        ) : isWebRtcViewer ? (
          <iframe src={streamUrl} style={{ width: '100%', height: 600, border: 0 }} />
        ) : isRtsp ? (
          <div>
            {/* RTSP 안내 문구 */}
            <NoteText style={{ marginTop: 0 }}>
              RTSP 스트림은 브라우저에서 직접 재생할 수 없어요. 아래 버튼을 눌러 VLC로 여세요.
            </NoteText>
            {/* 사용자 지정 URL 입력 */}
            <div style={{ marginBottom: 12 }}>
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder='네트워크 스트림 URL (예: http://13.209.97.113:8888/mystream)'
              />
            </div>
            <ActionsRow>
              {/* 일부 브라우저/OS는 rtsp:// 클릭 시 외부 앱 연결을 시도함 */}
              <Button onClick={() => { try { const url = (customUrl && customUrl.trim()) || streamUrl; if (!url) return; window.location.href = url; } catch {} }}>VLC로 열기</Button>
              <Button
                variant='secondary'
                onClick={() => {
                  // 클립보드 복사: 권한 이슈 대비 폴백 포함
                  const text = (customUrl && customUrl.trim()) || streamUrl;
                  const fallback = () => {
                    const input = document.createElement('input');
                    input.value = text;
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand('copy');
                    document.body.removeChild(input);
                  };
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).catch(fallback);
                  } else {
                    fallback();
                  }
                }}
              >
                링크 복사
              </Button>
              {/* 직접 링크로 열기 (시스템 핸들러가 등록된 경우) */}
              <a href={(customUrl && customUrl.trim()) || streamUrl} target='_blank' rel='noopener noreferrer'>직접 열기</a>
            </ActionsRow>
            <NoteText>
              자동 실행이 되지 않으면, 복사한 링크를 VLC의 네트워크 스트림 열기 메뉴에 붙여넣어 실행하세요.
            </NoteText>
          </div>
        ) : (
          <video src={streamUrl} controls autoPlay muted style={{ width: '100%', borderRadius: 12 }} />
        )}
      </Panel>
      <Panel>
        <Title>이벤트 로그</Title>
        <ul style={{ padding: 0, margin: 0 }}>
          {events.map((e, idx) => (
            <EventItem key={idx}>
              <div style={{ color: 'white' }}>{e.type}</div>
              <div>{new Date(e.timestamp).toLocaleString()}</div>
              <div>{e.message}</div>
            </EventItem>
          ))}
        </ul>
      </Panel>
    </Grid>
  );
}


