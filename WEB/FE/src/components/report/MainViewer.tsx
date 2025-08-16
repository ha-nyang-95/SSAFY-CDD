import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import type { CrackItem, TaskResponseDto } from '../../api/types';
import { lazy, Suspense } from 'react';
import { getTaskHistory, getPreviousTaskCracks } from '../../api/tasks';
import Button from '../../components/Button';
import LidarJsonModal from './LidarJsonModal';
import DescriptionModal from './DescriptionModal';

// 리포트 하위 뷰어는 용량이 크므로 지연 로딩하여 초기 번들 크기를 줄입니다.
const Interactive3DViewer = lazy(() => import('./Interactive3DViewer'));
const SplatViewer = lazy(() => import('./SplatViewer'));
const RecordedVideoPlayer = lazy(() => import('./RecordedVideoPlayer'));
const ModelViewer3D = lazy(() => import('./ModelViewer3D'));
// 이미지 갤러리는 영상 주변에서 노출하지 않도록 제거

type Props = {
  images: string[];
  videoUrl: string;
  modelingUrl?: string;
  detectionUrl?: string;
  cracks: CrackItem[];
  onSelectCrack: (c: CrackItem) => void;
  onOpenCracks?: () => void;
  taskId?: string; // 작업 ID 추가
  description?: string; // 작업 설명 추가
};

const Card = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.components.cards.default.padding,
  border: p.theme.components.cards.default.border,
  backdropFilter: p.theme.components.cards.default.backdropFilter,
  position: 'relative',
  zIndex: 0,
}));

const TabsBar = styled.div((p) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: p.theme.spacing.md,
  gap: p.theme.spacing.md,
}));

const Tabs = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.sm,
}));

const Tab = styled.button<{ $active?: boolean }>((p) => ({
  backgroundColor: p.$active ? p.theme.colors.primary.accent : p.theme.colors.secondary.medium,
  color: p.theme.colors.primary.text_primary,
  border: 'none',
  borderRadius: p.theme.components.buttons.primary.borderRadius,
  padding: `${p.theme.spacing.sm} ${p.theme.spacing.md}`,
  fontWeight: 700,
  cursor: 'pointer',
}));

const ComparisonSection = styled.div((p) => ({
  marginTop: p.theme.spacing.lg,
  padding: p.theme.spacing.lg,
  backgroundColor: p.theme.colors.neutral[50],
  borderRadius: p.theme.components.cards.default.borderRadius,
  border: `1px solid ${p.theme.colors.neutral[200]}`,
}));

const ComparisonTitle = styled.h3((p) => ({
  margin: '0 0 16px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: p.theme.colors.primary.text_primary,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const ComparisonGrid = styled.div(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
  marginBottom: '16px',
}));

const ComparisonCard = styled.div((p) => ({
  padding: '16px',
  backgroundColor: p.theme.colors.neutral[50],
  borderRadius: '8px',
  border: `2px solid ${p.theme.colors.neutral[300]}`,
}));

const ComparisonCardTitle = styled.div((p) => ({
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '12px',
  color: p.theme.colors.neutral[700],
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}));

const ComparisonItem = styled.div((p) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  fontSize: '13px',
  borderBottom: `1px solid ${p.theme.colors.neutral[200]}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ComparisonLabel = styled.span((p) => ({
  color: p.theme.colors.neutral[600],
  fontWeight: '500',
}));

const ComparisonValue = styled.span((p) => ({
  fontWeight: '600',
  color: p.theme.colors.neutral[800],
}));

const ComparisonButton = styled(Button)<{ $showComparison: boolean }>((p) => ({
  marginBottom: '12px',
  border: `2px solid ${p.theme.colors.neutral[300]}`,
  backgroundColor: p.$showComparison ? p.theme.colors.primary.accent_light : p.theme.colors.neutral[50],
  color: p.$showComparison ? p.theme.colors.primary.accent : p.theme.colors.neutral[700],
  fontWeight: '500'
}));

const PreviousTaskList = styled.div((p) => ({
  display: 'grid',
  gap: '8px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '8px',
  backgroundColor: p.theme.colors.neutral[100],
  borderRadius: '8px'
}));

const PreviousTaskItem = styled.div((p) => ({
  padding: '12px',
  backgroundColor: p.theme.colors.neutral[50],
  borderRadius: '6px',
  border: `1px solid ${p.theme.colors.neutral[200]}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}));

const PreviousTaskTitle = styled.div((p) => ({
  fontWeight: '500',
  marginBottom: '4px',
  color: p.theme.colors.neutral[800]
}));

const PreviousTaskDate = styled.div((p) => ({
  fontSize: '12px',
  color: p.theme.colors.neutral[500]
}));

const PreviousTaskStatus = styled.span<{ $status: string }>((p) => ({
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '500',
  backgroundColor: p.$status === 'ACTIVE' ? p.theme.colors.primary.accent_light : p.theme.colors.neutral[100],
  color: p.$status === 'ACTIVE' ? p.theme.colors.primary.accent : p.theme.colors.neutral[600],
  border: `1px solid ${p.$status === 'ACTIVE' ? p.theme.colors.primary.accent : p.theme.colors.neutral[300]}`
}));

const CrackImageGallery = styled.div((p) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '8px',
  maxHeight: '300px',
  overflowY: 'auto',
  padding: '8px',
  backgroundColor: p.theme.colors.neutral[100],
  borderRadius: '6px'
}));

const CrackImageItem = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px'
});

const CrackImage = styled.img<{ $status: string }>((p) => ({
  width: '100%',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '4px',
  border: `2px solid ${p.$status === 'INACTIVE' ? p.theme.colors.primary.accent : p.theme.colors.primary.accent}`
}));

const CrackImagePlaceholder = styled.div((p) => ({
  width: '100%',
  height: '80px',
  backgroundColor: p.theme.colors.neutral[200],
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: p.theme.colors.neutral[500],
  fontSize: '12px'
}));

const CrackLabel = styled.div((p) => ({
  fontSize: '11px',
  color: p.theme.colors.neutral[600],
  textAlign: 'center'
}));

const CrackStatusBadge = styled.span<{ $status: string }>((p) => ({
  padding: '2px 6px',
  borderRadius: '8px',
  fontSize: '10px',
  fontWeight: '500',
  backgroundColor: p.$status === 'INACTIVE' ? p.theme.colors.primary.accent_light : p.theme.colors.primary.accent_light,
  color: p.$status === 'INACTIVE' ? p.theme.colors.primary.accent : p.theme.colors.primary.accent,
  border: `1px solid ${p.$status === 'INACTIVE' ? p.theme.colors.primary.accent : p.theme.colors.primary.accent}`
}));

const SectionTitle = styled.h4((p) => ({
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: '600',
  color: p.theme.colors.neutral[800]
}));

const GalleryTitle = styled.h5((p) => ({
  margin: '0 0 12px 0',
  fontSize: '13px',
  fontWeight: '600',
  color: p.theme.colors.neutral[800]
}));

const LoadingMessage = styled.div((p) => ({
  textAlign: 'center',
  padding: '20px',
  color: p.theme.colors.neutral[500]
}));

const EmptyMessage = styled.div((p) => ({
  textAlign: 'center',
  padding: '20px',
  color: p.theme.colors.neutral[500]
}));

export default function MainViewer({ 
  images, 
  videoUrl, 
  modelingUrl, 
  detectionUrl, 
  cracks, 
  onSelectCrack, 
  onOpenCracks,
  taskId,
  description
}: Props) {
  const [tab, setTab] = useState<'composite' | 'media'>('media');
  const [previousTasks, setPreviousTasks] = useState<TaskResponseDto[]>([]);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [selectedPreviousTask, setSelectedPreviousTask] = useState<TaskResponseDto | null>(null);
  const [selectedPreviousTaskCracks, setSelectedPreviousTaskCracks] = useState<CrackItem[]>([]);
  const [isLoadingPreviousCracks, setIsLoadingPreviousCracks] = useState<boolean>(false);
  const [openLidarModal, setOpenLidarModal] = useState<boolean>(false);
  const [lidarJsonUrlForModal, setLidarJsonUrlForModal] = useState<string | undefined>(undefined);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);

  // 이전 작업 조회
  useEffect(() => {
    if (!taskId || !showComparison) return;
    
    const fetchPreviousTasks = async () => {
      try {
        setIsLoadingComparison(true);
        const history = await getTaskHistory(taskId);
        setPreviousTasks(history);
      } catch (error) {
        console.error('이전 작업 조회 실패:', error);
        setPreviousTasks([]);
      } finally {
        setIsLoadingComparison(false);
      }
    };

    fetchPreviousTasks();
  }, [taskId, showComparison]);

  // 선택된 이전 작업의 균열 정보 조회
  useEffect(() => {
    if (!selectedPreviousTask) {
      setSelectedPreviousTaskCracks([]);
      return;
    }

    const fetchPreviousTaskCracks = async () => {
      try {
        setIsLoadingPreviousCracks(true);
        const cracks = await getPreviousTaskCracks(String(selectedPreviousTask.taskId));
        setSelectedPreviousTaskCracks(cracks);
      } catch (error) {
        console.error('이전 작업 균열 정보 조회 실패:', error);
        setSelectedPreviousTaskCracks([]);
      } finally {
        setIsLoadingPreviousCracks(false);
      }
    };

    fetchPreviousTaskCracks();
  }, [selectedPreviousTask]);

  return (
    <Card>
      <TabsBar>
        <Tabs>
          <Tab $active={tab === 'composite'} onClick={() => setTab('composite')} aria-pressed={tab === 'composite'}>
            3D 렌더링
          </Tab>
          <Tab $active={tab === 'media'} onClick={() => setTab('media')} aria-pressed={tab === 'media'}>
            녹화 영상
          </Tab>
        </Tabs>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={() => setIsNoteModalOpen(true)}>
            노트보기
          </Button>
          <Button variant="secondary" size="sm" onClick={onOpenCracks}>균열 목록</Button>
        </div>
      </TabsBar>
      
      <Suspense fallback={<div style={{ padding: 12 }}>뷰어를 불러오는 중…</div>}>
        {tab === 'composite' ? (
          modelingUrl ? (
            modelingUrl.toLowerCase().endsWith('.splat') ? (
              <SplatViewer src={modelingUrl} />
            ) : (
              <ModelViewer3D src={modelingUrl} />
            )
          ) : (
            <Interactive3DViewer cracks={cracks} onSelectCrack={onSelectCrack} />
          )
        ) : (
          // 한국어 주석: 요청에 따라 원본 영상은 로드하지 않고, 디텍션 영상만 표시
          <div className="no-print">
            {detectionUrl && detectionUrl.trim() ? (
              <RecordedVideoPlayer src={detectionUrl} />
            ) : (
              <div style={{ padding: 16 }}>디텍션 영상이 없습니다.</div>
            )}
          </div>
        )}
      </Suspense>

      {/* 이전 작업 비교 섹션 */}
      {taskId && (
        <ComparisonSection>
          <ComparisonTitle>
            작업 비교 분석
            {previousTasks.length > 0 && (
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>
                (이전 작업 {previousTasks.length}건과 비교)
              </span>
            )}
          </ComparisonTitle>
          
          <ComparisonButton
            variant="ghost"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
            $showComparison={showComparison}
          >
            {showComparison ? '비교 숨기기' : '이전 작업과 비교하기'}
          </ComparisonButton>

          {showComparison && (
            <div>
              {isLoadingComparison ? (
                <LoadingMessage>
                  이전 작업을 불러오는 중...
                </LoadingMessage>
              ) : previousTasks.length > 0 ? (
                <div>
                  {/* 이전 작업 목록 */}
                  <div style={{ marginBottom: '20px' }}>
                    <SectionTitle>
                      이전 작업 목록
                    </SectionTitle>
                    <PreviousTaskList>
                      {previousTasks.map((task, index) => (
                        <PreviousTaskItem
                          key={`${task.taskId}-${index}`}
                          onClick={() => {
                            // 선택된 이전 작업으로 비교 창 표시
                            setSelectedPreviousTask(task);
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <PreviousTaskTitle>{task.locationName}</PreviousTaskTitle>
                              <PreviousTaskDate>{new Date(task.createdAt).toLocaleDateString('ko-KR')}</PreviousTaskDate>
                            </div>
                            <PreviousTaskStatus $status={task.status}>
                              {task.status === 'ACTIVE' ? '진행중' : '완료'}
                            </PreviousTaskStatus>
                          </div>
                        </PreviousTaskItem>
                      ))}
                    </PreviousTaskList>
                  </div>

                  {/* 선택된 이전 작업과의 비교 */}
                  {selectedPreviousTask && (
                    <div style={{ 
                      padding: '16px',
                      backgroundColor: 'var(--primary-accent-light, rgba(59, 130, 246, 0.05))',
                      borderRadius: '8px',
                      border: '1px solid var(--primary-accent-medium, rgba(59, 130, 246, 0.2))'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--primary-accent, #3b82f6)' }}>
                          비교 분석: {new Date(selectedPreviousTask.createdAt).toLocaleDateString('ko-KR')} 작업
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPreviousTask(null)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          ✕
                        </Button>
                      </div>
                      
                      <ComparisonGrid>
                        {/* 선택된 이전 작업 */}
                        <ComparisonCard>
                          <ComparisonCardTitle>
                            {new Date(selectedPreviousTask.createdAt).toLocaleDateString('ko-KR')} 작업
                          </ComparisonCardTitle>
                          <ComparisonItem>
                            <ComparisonLabel>위치</ComparisonLabel>
                            <ComparisonValue>{selectedPreviousTask.locationName}</ComparisonValue>
                          </ComparisonItem>
                          <ComparisonItem>
                            <ComparisonLabel>상태</ComparisonLabel>
                            <ComparisonValue>
                              {selectedPreviousTask.status === 'ACTIVE' ? '진행중' : '완료'}
                            </ComparisonValue>
                          </ComparisonItem>
                          <ComparisonItem>
                            <ComparisonLabel>작업일시</ComparisonLabel>
                            <ComparisonValue>
                              {new Date(selectedPreviousTask.createdAt).toLocaleString('ko-KR')}
                            </ComparisonValue>
                          </ComparisonItem>
                          <ComparisonItem>
                            <ComparisonLabel>균열 수</ComparisonLabel>
                            <ComparisonValue>
                              {isLoadingPreviousCracks ? '로딩중...' : `${selectedPreviousTaskCracks.length}건`}
                            </ComparisonValue>
                          </ComparisonItem>
                          <ComparisonItem>
                            <ComparisonLabel>확인된 균열</ComparisonLabel>
                            <ComparisonValue>
                              {isLoadingPreviousCracks ? '로딩중...' : `${selectedPreviousTaskCracks.filter(c => c.status === 'INACTIVE').length}건`}
                            </ComparisonValue>
                          </ComparisonItem>
                          <ComparisonItem>
                            <ComparisonLabel>미확인 균열</ComparisonLabel>
                            <ComparisonValue>
                              {isLoadingPreviousCracks ? '로딩중...' : `${selectedPreviousTaskCracks.filter(c => c.status === 'ACTIVE').length}건`}
                            </ComparisonValue>
                          </ComparisonItem>
                        </ComparisonCard>
                      </ComparisonGrid>
                      
                      {/* 이전 작업 균열 이미지 갤러리 */}
                      {selectedPreviousTaskCracks.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <GalleryTitle>
                            이전 작업 균열 이미지
                          </GalleryTitle>
                          <CrackImageGallery>
                            {selectedPreviousTaskCracks.map((crack, index) => (
                              <CrackImageItem key={`${crack.id}-${index}`}>
                                { (crack.segmentedUrl || crack.imageUrl) ? (
                                  <CrackImage
                                    src={crack.segmentedUrl || crack.imageUrl}
                                    alt={`균열 ${crack.id}`}
                                    $status={crack.status}
                                    onClick={() => {
                                      // 한국어 주석: 이미지 클릭 시 해당 균열의 lidar.json을 모달로 표시
                                      setLidarJsonUrlForModal(crack.lidarJsonUrl);
                                      setOpenLidarModal(true);
                                    }}
                                  />
                                ) : (
                                  <CrackImagePlaceholder>
                                    이미지 없음
                                  </CrackImagePlaceholder>
                                )}
                                <CrackLabel>{crack.label}</CrackLabel>
                                <CrackStatusBadge $status={crack.status}>
                                  {crack.status === 'INACTIVE' ? '확인됨' : '미확인'}
                                </CrackStatusBadge>
                              </CrackImageItem>
                            ))}
                          </CrackImageGallery>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <EmptyMessage>
                  이전 작업 이력이 없어 비교할 수 없습니다.
                </EmptyMessage>
              )}
            </div>
          )}
        </ComparisonSection>
      )}
      {/* 한국어 주석: 이전 작업 이미지 클릭 시 노출되는 LiDAR JSON 모달 */}
      <LidarJsonModal
        isVisible={openLidarModal}
        jsonUrl={lidarJsonUrlForModal}
        onClose={() => setOpenLidarModal(false)}
      />
      
      {/* 작업 노트 모달 */}
      <DescriptionModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        description={description || ''}
        title="작업 노트"
      />
    </Card>
  );
}

