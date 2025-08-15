import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ReportDetail, CrackItem } from '../../api/types';
import { getInspectionReport } from '../../api/tasks';
import ReportHeader from '../../components/report/ReportHeader';
import MainViewer from '../../components/report/MainViewer';
import DetailPanel from '../../components/report/DetailPanel';

const Layout = styled.div((p) => ({
  position: 'relative',
}));

const Drawer = styled.aside<{ $open: boolean }>((p) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100%',
  // 한국어 주석: 반응형 너비 - 뷰포트의 약 30%를 목표로 하되 너무 작거나 크지 않도록 제한
  width: p.$open ? 'clamp(300px, 30vw, 560px)' : '0px',
  overflowX: 'hidden',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderLeft: p.$open ? p.theme.components.cards.default.border : 'none',
  boxShadow: p.$open ? p.theme.effects.shadows.lg : 'none',
  transition: 'width 0.25s ease',
  padding: p.$open ? p.theme.spacing.md : '0px',
  zIndex: 10,
  // 반응형: 모바일에서는 전체 폭의 92%로 표시
  ['@media (max-width: 768px)']: {
    // 모바일에서는 화면 반(50%)만 차지하도록 조정
    width: p.$open ? '50vw' : '0px',
  },
}));

const DrawerScrim = styled.div<{ $open: boolean }>((p) => ({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  opacity: p.$open ? 1 : 0,
  pointerEvents: p.$open ? 'auto' : 'none',
  transition: 'opacity 0.25s ease',
}));

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [selected, setSelected] = useState<CrackItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  // ESC로 드로어 닫기
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);
  // 한국어 주석: description이 JSON 문자열일 경우 화면에 노출하지 않도록 판별
  const isJsonLike = (text: string | undefined | null): boolean => {
    try {
      let s = (text ?? '').trim();
      if (!s) return false;
      // 선행되는 null, undefined, 괄호 등의 토큰 제거 후 JSON 시작 문자를 탐색
      const idx = s.search(/[\[{]/);
      if (idx <= 0) return false;
      const candidate = s.slice(idx);
      const parsed = JSON.parse(candidate);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!id) return;
    const date = new Date().toISOString();
    setLoading(true);
    setErrorMessage('');
    getInspectionReport(id, date)
      .then(setReport)
      .catch((e) => {
        console.error(e);
        setErrorMessage((e as Error).message || '보고서 로드 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 한국어 주석: 최초에는 목록만 보여주기 위해 자동 선택을 하지 않습니다.

  if (loading) return <p aria-busy="true">보고서를 불러오는 중…</p>;
  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (!report) return <p>데이터가 없습니다.</p>;

  return (
    <div>
      <ReportHeader
        inspectionName={report.inspectionName}
        date={report.date}
        locationArea={report.locationArea}
      />
      {/* 요청에 따라 메모/설명은 화면에 노출하지 않습니다. 필요 시 관리 화면에서만 확인 */}
      <Layout>
        <MainViewer
          images={report.media.images}
          videoUrl={report.media.videoUrl}
          modelingUrl={report.media.modelingUrl}
          detectionUrl={report.media.detectionUrl}
          cracks={report.cracks}
          onSelectCrack={(c) => setSelected(c)}
          onOpenCracks={() => setIsDrawerOpen(true)}
          taskId={id}
        />
        <DrawerScrim $open={isDrawerOpen} onClick={() => setIsDrawerOpen(false)} />
        <Drawer $open={isDrawerOpen}>
          <DetailPanel 
            cracks={report.cracks} 
            selected={selected} 
            onSelect={setSelected}
            onCrackDeleted={(crackId) => {
              // 균열 삭제 시 배열에서 제거
              setReport(prev => prev ? {
                ...prev,
                cracks: prev.cracks.filter(c => c.id !== crackId)
              } : null);
              
              // 선택된 균열이 삭제된 경우 선택 해제
              if (selected && selected.id === crackId) {
                setSelected(null);
              }
            }}
          />
        </Drawer>
      </Layout>
    </div>
  );
}


