import { useEffect, useMemo, useState } from 'react';
import Button from '../Button';
import { fetchPublicJson } from '../../utils/openExternal';

type Props = {
  isVisible: boolean;
  jsonUrl?: string;
  onClose: () => void;
};

export default function LidarJsonModal({ isVisible, jsonUrl, onClose }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rawJson, setRawJson] = useState<string>('');
  const [showRaw, setShowRaw] = useState<boolean>(false);

  // 모달이 열릴 때에만 JSON 로드
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        setRawJson('');
        if (!jsonUrl) {
          setErrorMessage('연결된 LiDAR JSON이 없습니다.');
          return;
        }
        const data = await fetchPublicJson<any>(jsonUrl);
        if (cancelled) return;
        try {
          setRawJson(JSON.stringify(data, null, 2));
        } catch {
          setRawJson('');
        }
      } catch (e) {
        if (!cancelled) {
          setErrorMessage('LiDAR 데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    if (isVisible) load();
    return () => {
      cancelled = true;
    };
  }, [isVisible, jsonUrl]);

  // ESC로 닫기
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, onClose]);

  const summary = useMemo(() => {
    if (!rawJson) return null as null | { detected: boolean | null; suspicionPoints: number | null; depthMax: number | null };
    try {
      const obj = JSON.parse(rawJson);
      const detected: boolean | null = typeof obj.crack_detected === 'boolean' ? obj.crack_detected : null;
      const sp = typeof obj.suspicion_points === 'number' ? obj.suspicion_points : (obj.suspicion_points ? Number(obj.suspicion_points) : null);
      const suspicionPoints = Number.isFinite(sp as number) ? (sp as number) : null;
      const dm = obj.depth_max ?? obj.depthMax ?? obj.maxDepth;
      const dmNum = typeof dm === 'number' ? dm : parseFloat(dm);
      const depthMax = Number.isFinite(dmNum) ? dmNum : null;
      return { detected, suspicionPoints, depthMax };
    } catch {
      return null;
    }
  }, [rawJson]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          color: '#111827',
          borderRadius: 12,
          width: 'min(720px, 92vw)',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: 20,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>LiDAR 분석 결과</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>닫기</Button>
        </div>

        {isLoading && (
          <div style={{ padding: 12 }}>불러오는 중…</div>
        )}
        {!isLoading && errorMessage && (
          <div role="alert" style={{ padding: 12, color: '#ef4444' }}>{errorMessage}</div>
        )}

        {!isLoading && !errorMessage && summary && (
          <div style={{
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}>
            <div style={{ marginBottom: 6 }}>
              {summary.detected == null ? '균열 감지: -' : `균열 감지: ${summary.detected ? 'TRUE' : 'FALSE'}`}
            </div>
            <div style={{ marginBottom: 6 }}>
              균열감지 횟수: {summary.suspicionPoints ?? '-'}
            </div>
            <div>
              최대 깊이: {summary.depthMax != null ? summary.depthMax.toFixed(2) : '-'}
            </div>
          </div>
        )}

        {!isLoading && !errorMessage && rawJson && (
          <div>
            <Button variant="secondary" size="sm" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? '원본 JSON 숨기기' : '원본 JSON 보기'}
            </Button>
            {showRaw && (
              <pre
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: '#0b1022',
                  color: '#e5e7eb',
                  borderRadius: 8,
                  overflowX: 'auto',
                }}
              >{rawJson}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


