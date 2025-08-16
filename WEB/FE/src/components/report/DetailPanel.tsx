import styled from '@emotion/styled';
import type { CrackItem } from '../../api';
import SegmentedImageViewer from './SegmentedImageViewer';
import LidarJsonModal from './LidarJsonModal';
import { useEffect, useState } from 'react';
import MemoInput from './MemoInput';
import { saveCrackMemo } from '../../api/tasks';
import { markCrack, deleteCrack } from '../../api/cracks';
import CrackList from './CrackList';
import CrackStatusDisplay from './CrackStatusDisplay';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import LiDARDataSummary from './LiDARDataSummary';
import ImageDownloadButtons from './ImageDownloadButtons';
import { formatCrackId } from '../../utils/mappers';

type Props = {
  cracks: CrackItem[];
  selected: CrackItem | null;
  onSelect: (c: CrackItem | null) => void;
  onCrackDeleted?: (crackId: string) => void;
};

const Panel = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.components.cards.default.padding,
  border: p.theme.components.cards.default.border,
  backdropFilter: p.theme.components.cards.default.backdropFilter,
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.md,
}));

const Title = styled.h3((p) => ({
  margin: 0,
  color: p.theme.colors.primary.text_primary,
}));

const BackButton = styled.button(() => ({
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'inherit',
  padding: 6,
  borderRadius: 8
}));

export default function DetailPanel({ cracks, selected, onSelect, onCrackDeleted }: Props) {
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [openLidarModal, setOpenLidarModal] = useState<boolean>(false);
  const [, forceUpdate] = useState({});

  // 균열 확인 처리
  const handleMarkCrack = async (crackId: string) => {
    try {
      setIsMarking(true);
      await markCrack(Number(crackId));
      const updatedCrack = cracks.find(c => c.id === crackId);
      if (updatedCrack) {
        updatedCrack.status = 'INACTIVE';
        forceUpdate({});
      }
    } catch (error) {
      console.error('균열 확인 실패:', error);
      alert('균열 확인에 실패했습니다.');
    } finally {
      setIsMarking(false);
    }
  };

  // 균열 삭제 처리
  const handleDeleteCrack = async (crackId: string) => {
    try {
      setIsDeleting(true);
      await deleteCrack(Number(crackId));
      
      if (onCrackDeleted) {
        onCrackDeleted(crackId);
      }
      
      if (selected && selected.id === crackId) {
        onSelect(null);
      }
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('균열 삭제 실패:', error);
      alert('균열 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 균열 목록 화면
  if (!selected) {
    return (
      <Panel>
        <Title>감지된 균열 목록</Title>
        <CrackList cracks={cracks} onSelectCrack={onSelect} />
      </Panel>
    );
  }

  // 균열 상세 화면
  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <BackButton onClick={() => onSelect(null)} aria-label="뒤로">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BackButton>
      </div>
      
      <Title>균열 {formatCrackId(selected.crackName)} — {selected.label}</Title>
      
      <CrackStatusDisplay
        crack={selected}
        isMarking={isMarking}
        onMarkCrack={handleMarkCrack}
        onDeleteCrack={() => setShowDeleteConfirm(true)}
      />

      <SegmentedImageViewer
        src={selected.segmentedUrl}
        onClick={() => {
          // 한국어 주석: 세그먼트 이미지를 클릭하면 lidar.json 모달을 엽니다.
          setOpenLidarModal(true);
        }}
      />
      <LiDARDataSummary crack={selected} />
      
      <MemoInput
        onSave={async (text) => {
          try {
            const taskId = String(window.location.pathname.split('/').pop());
            if (!taskId) throw new Error('유효하지 않은 작업 ID');
            const raw = text ?? '';
            const memo = raw.endsWith('\n\n') ? raw : raw.endsWith('\n') ? raw + '\n' : raw + '\n\n';
            const payload = { crackName: selected.crackName, label: selected.label, memo };
            await saveCrackMemo(taskId, payload);
            window.dispatchEvent(new CustomEvent('app:toast', { 
              detail: { message: '메모를 저장했습니다.', type: 'success' } 
            }));
          } catch (e) {
            window.dispatchEvent(new CustomEvent('app:toast', { 
              detail: { message: '메모 저장에 실패했습니다.', type: 'error' } 
            }));
          }
        }}
      />
      
      <ImageDownloadButtons 
        imageUrl={selected.imageUrl} 
        segmentedUrl={selected.segmentedUrl} 
      />

      <DeleteConfirmDialog
        crackId={selected.id}
        crackLabel={selected.crackName}
        isVisible={showDeleteConfirm}
        isDeleting={isDeleting}
        onConfirm={() => handleDeleteCrack(selected.id)}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* 한국어 주석: lidar.json 뷰 모달 */}
      <LidarJsonModal
        isVisible={openLidarModal}
        jsonUrl={selected.lidarJsonUrl}
        onClose={() => setOpenLidarModal(false)}
      />
    </Panel>
  );
}


