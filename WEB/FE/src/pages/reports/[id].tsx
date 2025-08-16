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
  ['@media (max-width: 768px)']: {
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
          description={report.description}
        />
        <DrawerScrim $open={isDrawerOpen} onClick={() => setIsDrawerOpen(false)} />
        <Drawer $open={isDrawerOpen}>
          <DetailPanel 
            cracks={report.cracks} 
            selected={selected} 
            onSelect={setSelected}
            onCrackDeleted={(crackId) => {
              setReport(prev => prev ? {
                ...prev,
                cracks: prev.cracks.filter(c => c.id !== crackId)
              } : null);
              
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


