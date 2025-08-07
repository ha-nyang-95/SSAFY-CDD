import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Layout Components
import AppContainer from '../layouts/AppContainer';
import MainWrapper from '../layouts/MainWrapper';
import MainContent from '../layouts/MainContent';
import ContentView from '../layouts/ContentView';

// Organism Components
import AppHeader from '../components/organisms/AppHeader';
import ActionSidebar from '../components/organisms/ActionSidebar';
import LiveFeedContainer from '../components/organisms/LiveFeedContainer';
import ContentCard from '../components/organisms/ContentCard';
import CrackAnalysisSummary from '../components/organisms/CrackAnalysisSummary';
import StructureManagementList from '../components/organisms/StructureManagementList';
import DetailModal from '../components/organisms/DetailModal';
import CreateStructureModal from '../components/organisms/CreateStructureModal';

// Atom Components (for placeholder content)
import Text from '../components/atoms/Text';

// API Services
import {
  getCracks,
  getCrackDetail,
  getStructures,
  createStructure,
  generateLink,
  getLiveFeedStatus,
  CrackDetail,
  Structure,
} from '../services/api';

import { useAuth } from '../contexts/AuthContext';

// PageHeader가 그리드의 첫 번째 행 중앙에 위치하도록 수정합니다.
const PageHeader = styled.div`
  display: grid;
  justify-items: center; /* 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  flex-shrink: 0;
`;

const PageTitle = styled(Text).attrs({ variant: 'h1' })`
  font-size: 3rem; // 48px
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// '콘텐츠 박스' 역할을 할 컨테이너.
const PageContent = styled.div`
  flex-grow: 1; /* MainContent의 남은 공간을 모두 차지 */
  display: flex; /* 내부 컨텐츠(ContentView)를 채우기 위함 */
  min-height: 0; /* flex 자식 요소의 크기가 부모를 넘어서는 것을 방지 */
`;

const LeftColumn = styled.section`
  flex: 7;
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.section`
  flex: 3;
  display: flex;
  flex-direction: column;
`;

const Viewer3DContainer = styled(ContentCard)`
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.border}; /* Use border color for background */
  border: 2px dashed ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.textSecondary};
  font-weight: 500;
  font-size: 1.2rem;
`;

const VIEW_TITLES = {
  realTime: '실시간 모니터링',
  threeDModel: '3D 모델 시각화',
  structureManagement: '구조물 관리',
};

const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<
    'realTime' | 'threeDModel' | 'structureManagement'
  >('realTime');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCrackId, setSelectedCrackId] = useState<string | null>(null);
  const [isCreateStructureModalOpen, setIsCreateStructureModalOpen] = useState(false);

  const { isLoggedIn, currentUser } = useAuth();

  const user = isLoggedIn ? { name: currentUser } : null;


  // Mock data as per mockup.html
  const allCrackData = {
    "C-001": { id: "C-001", severity: "높음", severityClass: "high", location: "4B 구역, 2번 기둥", coordinates: "37.5665° N, 126.9780° E", dimensions: { length: "150.5 mm", width: "2.1 mm", depth: "10.3 mm" }, scanData: "LiDAR 스캔 데이터 파일 (scan_c001.laz)", trend: "지난 주 대비 15% 확장" },
    "C-002": { id: "C-002", severity: "중간", severityClass: "medium", location: "7A 구역, 상판 하부", coordinates: "37.5660° N, 126.9791° E", dimensions: { length: "80.2 mm", width: "1.2 mm", depth: "5.8 mm" }, scanData: "LiDAR 스캔 데이터 파일 (scan_c002.laz)", trend: "변화 없음" },
    "C-003": { id: "C-003", severity: "낮음", severityClass: "low", location: "1C 구역, 난간", coordinates: "37.5658° N, 126.9772° E", dimensions: { length: "25.0 mm", width: "0.5 mm", depth: "2.1 mm" }, scanData: "LiDAR 스캔 데이터 파일 (scan_c003.laz)", trend: "새로 발견됨" },
    "C-004": { id: "C-004", severity: "중간", severityClass: "medium", location: "5D 구역, 보", coordinates: "37.5671° N, 126.9805° E", dimensions: { length: "110.7 mm", width: "1.5 mm", depth: "7.2 mm" }, scanData: "LiDAR 스캔 데이터 파일 (scan_c004.laz)", trend: "안정 상태" }
  };
  const [structures, setStructures] = useState<Structure[]>([]);

  // Fetch cracks data (using mock data)
  const cracksData = Object.values(allCrackData);

  // Fetch crack detail data (using mock data)
  const crackDetailData = selectedCrackId ? allCrackData[selectedCrackId as keyof typeof allCrackData] : null;

  // Fetch structures data (using mock data)
  const structuresData = structures;

  // Live feed status (mocked)
  const liveFeedStatus = { status: 'live', url: '' };

  // Create structure mutation (mocked)
  const createStructureMutation = useMutation({
    mutationFn: createStructure,
    onSuccess: (newStructure) => {
      setStructures((prev) => [...prev, { ...newStructure, id: String(prev.length + 1) }]); // Assign a simple ID
      setIsCreateStructureModalOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create structure:', error);
      alert('Failed to create structure.');
    },
  });

  // Generate link mutation (mocked)
  const generateLinkMutation = useMutation({
    mutationFn: generateLink,
    onSuccess: (data) => {
      // This will be handled by the CreateStructureModal component directly
    },
    onError: (error) => {
      console.error('Failed to generate link:', error);
      alert('Failed to generate link.');
    },
  });

  const handleCrackItemClick = (crackId: string) => {
    setSelectedCrackId(crackId);
    setIsDetailModalOpen(true);
  };

  const handleCreateStructureSubmit = (data: { name: string; location: string; link: string }) => {
    createStructureMutation.mutate(data);
  };

  const handleGenerateLink = async () => {
    // Mock link generation
    return `https://shyo2.com/models/${Date.now()}`;
  };

  return (
    <AppContainer>
      <AppHeader />
      <MainWrapper>
        <ActionSidebar activeView={activeView} onNavClick={setActiveView} />
        {/* --- JSX 구조를 새로운 2단 박스 구조로 변경 --- */}
        <MainContent>
          {/* 첫 번째 박스: 제목 */}
          <PageHeader>
            <PageTitle>{VIEW_TITLES[activeView]}</PageTitle>
          </PageHeader>
          
          {/* 두 번째 박스: 메인 콘텐츠 */}
          <PageContent>
            {activeView === 'realTime' && (
              <ContentView justifyContent="center" alignItems="center">
                <LiveFeedContainer />
              </ContentView>
            )}
            
            {activeView === 'threeDModel' && (
              <ContentView style={{ alignItems: 'stretch' }}>
                <LeftColumn>
                  <Viewer3DContainer title="3D 모델 시각화 영역">
                    3D 모델 시각화 영역
                  </Viewer3DContainer>
                </LeftColumn>
                <RightColumn>
                  <ContentCard title="균열 분석 요약">
                    <CrackAnalysisSummary
                      crackData={cracksData as any}
                      onCrackItemClick={handleCrackItemClick}
                    />
                  </ContentCard>
                </RightColumn>
              </ContentView>
            )}

            {activeView === 'structureManagement' && (
              <ContentView style={{ alignItems: 'stretch' }}>
                <StructureManagementList
                  structures={structuresData}
                  onCreateStructureClick={() => setIsCreateStructureModalOpen(true)}
                />
              </ContentView>
            )}
          </PageContent>
        </MainContent>
      </MainWrapper>

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCrackId(null);
        }}
        crackDetailData={crackDetailData}
      />

      <CreateStructureModal
        isOpen={isCreateStructureModalOpen}
        onClose={() => setIsCreateStructureModalOpen(false)}
        onSubmit={handleCreateStructureSubmit}
        onGenerateLink={handleGenerateLink}
      />
    </AppContainer>
  );
};

export default DashboardPage;