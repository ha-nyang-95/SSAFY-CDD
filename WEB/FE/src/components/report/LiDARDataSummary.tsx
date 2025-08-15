import { useEffect, useState } from 'react';
import { fetchPublicJson } from '../../utils/openExternal';
import type { CrackItem } from '../../api/types';

type Props = {
  crack: CrackItem;
};

export default function LiDARDataSummary({ crack }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [rawJson, setRawJson] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setIsLoading(true);
        setError('');
        if (crack.lidarJsonUrl) {
          const json = await fetchPublicJson<any>(crack.lidarJsonUrl);
          try {
            setRawJson(JSON.stringify(json, null, 2));
          } catch {
            setRawJson('');
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError('LiDAR 데이터를 불러오지 못했습니다.');
          setRawJson('');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [crack]);

  if (error) {
    return (
      <div role="alert" style={{ color: '#f00' }}>{error}</div>
    );
  }

  if (!rawJson) {
    return null;
  }

  return (
    <div aria-busy={isLoading ? 'true' : 'false'}>
      <LidarJsonSummary raw={rawJson} />
    </div>
  );
}

// 원본 JSON 문자열에서 핵심 필드를 추출하여 표시
function LidarJsonSummary({ raw }: { raw: string }) {
  let detected: boolean | null = null;
  let suspicionPoints: number | null = null;
  let depthMax: number | null = null;
  
  try {
    const obj = JSON.parse(raw);
    detected = typeof obj.crack_detected === 'boolean' ? obj.crack_detected : null;
    const sp = typeof obj.suspicion_points === 'number' ? obj.suspicion_points : (obj.suspicion_points ? Number(obj.suspicion_points) : null);
    suspicionPoints = Number.isFinite(sp as number) ? (sp as number) : null;
    const dm = obj.depth_max ?? obj.depthMax ?? obj.maxDepth;
    const dmNum = typeof dm === 'number' ? dm : parseFloat(dm);
    depthMax = Number.isFinite(dmNum) ? dmNum : null;
  } catch {
    // 무시: 파싱 실패 시 아무 것도 표시하지 않음
  }

  const grade = (n: number | null) => {
    if (n == null) return '';
    if (n >= 250) return '높음';
    if (n >= 100) return '중간';
    return '낮음';
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
      <div style={{ marginBottom: 6 }}>
        {detected == null ? '균열 감지: -' : `균열 감지: ${detected ? 'TRUE' : 'FALSE'}`}
      </div>
      <div style={{ marginBottom: 6 }}>
        균열감지 횟수: {suspicionPoints ?? '-'} {suspicionPoints != null ? `(${grade(suspicionPoints)})` : ''}
      </div>
      <div>
        최대 깊이: {depthMax != null ? depthMax.toFixed(2) : '-'}
      </div>
    </div>
  );
}
