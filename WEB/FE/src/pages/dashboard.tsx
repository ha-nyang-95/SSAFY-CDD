import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import type { Inspection } from '../api/types';
import { listInspections, listInspectionsByDistrict, createInspectionByDistrict } from '../api/tasks';
import { me } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import InspectionListTable from '../components/dashboard/InspectionListTable';

const HeaderRow = styled.div((p) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBlock: p.theme.spacing.lg,
  gap: p.theme.spacing.md,
  flexWrap: 'wrap',
  ['@media (max-width: 640px)']: {
    flexDirection: 'column',
    alignItems: 'stretch',
    // 상단 버튼이 잘리지 않도록 전체 폭 사용
    '& > button': {
      width: '100%',
    },
  },
}));

const Title = styled.h2((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h2.fontSize,
  fontWeight: p.theme.typography.scales.h2.fontWeight,
  lineHeight: p.theme.typography.scales.h2.lineHeight,
  color: p.theme.colors.primary.text_primary,
  margin: 0,
}));

// 모달 오버레이 & 카드
const ModalOverlay = styled.div((p) => ({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}));

const ModalCard = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.elevated.backgroundColor,
  borderRadius: p.theme.components.cards.elevated.borderRadius,
  padding: p.theme.components.cards.elevated.padding,
  boxShadow: p.theme.effects.shadows.modal,
  width: 'min(560px, 92vw)',
}));

const ModalTitle = styled.h3((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h3.fontSize,
  fontWeight: p.theme.typography.scales.h3.fontWeight,
  color: p.theme.colors.primary.text_primary,
  marginTop: 0,
}));

const ModalRow = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.md,
  alignItems: 'center',
  marginTop: p.theme.spacing.md,
}));

const IconButton = styled.button((p) => ({
  background: 'transparent',
  border: 'none',
  color: p.theme.colors.primary.text_secondary,
  cursor: 'pointer',
  padding: 8,
  borderRadius: 8,
  '&:hover': {
    backgroundColor: p.theme.colors.secondary.hover,
    color: p.theme.colors.primary.text_primary,
  },
}));

const Toast = styled.div((p) => ({
  position: 'fixed',
  right: 20,
  bottom: 20,
  backgroundColor: p.theme.components.cards.elevated.backgroundColor,
  color: p.theme.colors.primary.text_primary,
  border: '1px solid ' + p.theme.colors.neutral[200],
  boxShadow: p.theme.effects.shadows.modal,
  borderRadius: 12,
  padding: '10px 14px',
  zIndex: 1100,
}));

export default function DashboardPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [query, setQuery] = useState('');
  // 필터: 지역/내 작업
  const [scope, setScope] = useState<'REGION' | 'MINE'>('MINE');
  // 정렬: 생성시간 오름/내림
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 생성 모달 상태
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [regionName, setRegionName] = useState<string>('');
  const [structureName, setStructureName] = useState<string>('');
  const [detailAddress, setDetailAddress] = useState<string>('');
  const [issueLoading, setIssueLoading] = useState<boolean>(false);
  const [issuedSessionId, setIssuedSessionId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSessionIdVisible, setIsSessionIdVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    const fetcher = scope === 'REGION' ? listInspectionsByDistrict : listInspections;
    setIsLoading(true);
    fetcher()
      .then(setInspections)
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [scope]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isCreateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCreateModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCreateOpen]);

  const openCreateModal = async () => {
    setIsCreateOpen(true);
    setIssuedSessionId('');
    setCopied(false);
    setDetailAddress('');
    // 사용자 기본 지역 로드
    try {
      const user = await me();
      // 백엔드가 문자열 슬러그(예: "DAEJEON") 또는 한글 지역 문자열을 반환할 수 있음
      let regionRaw = '' as string;
      if (typeof user === 'string') {
        regionRaw = user;
      } else if (user && typeof user === 'object') {
        // @ts-expect-error 런타임 대응: 서버 타입 불일치 허용
        regionRaw = (user.regionName || user.region || '').toString();
      }
      const upper = regionRaw.trim().toUpperCase();
      const upperToKo: Record<string, string> = {
        SEOUL: '서울특별시', BUSAN: '부산광역시', DAEGU: '대구광역시', INCHEON: '인천광역시', GWANGJU: '광주광역시', DAEJEON: '대전광역시', ULSAN: '울산광역시', SEJONG: '세종특별자치시',
        GYEONGGI: '경기도', GANGWON: '강원특별자치도', CHUNGBUK: '충청북도', CHUNGNAM: '충청남도', JEONBUK: '전라북도', JEONNAM: '전라남도', GYEONGBUK: '경상북도', GYEONGNAM: '경상남도', JEJU: '제주특별자치도',
      };
      const ko = upperToKo[upper] ?? regionRaw.trim();
      setRegionName(ko);
    } catch {
      setRegionName('');
    }
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setStructureName('');
    setIssuedSessionId('');
  };

  const issueSessionId = async () => {
    if (issuedSessionId) return; // 이미 발급된 경우 재요청 방지
    const trimmedStructure = structureName.trim();
    const trimmedRegion = (regionName ?? '').trim();
    const trimmedDetail = (detailAddress ?? '').trim();
    if (!trimmedRegion) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '사용자 기본 지역을 불러오지 못했습니다. 다시 시도해 주세요.', type: 'warning' } })); return; }
    if (!trimmedDetail) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '상세 주소를 입력해 주세요.', type: 'warning' } })); return; }
    if (!trimmedStructure) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '구조물 이름을 입력해 주세요.', type: 'warning' } })); return; }
    try {
      setIssueLoading(true);
      // 예전 세션 생성 페이지와 동일: 시/도(첫 토큰) + 상세주소 + 구조물이름
      const provinceToken = (trimmedRegion.split(/\s+/)[0] || '').trim();
      const regionFullName = `${provinceToken} ${trimmedDetail} ${trimmedStructure}`;
      const created = await createInspectionByDistrict(regionFullName);
      setIssuedSessionId(created.sessionId);
      setIsSessionIdVisible(false);
      // 목록 갱신 시도
      const fetcher = scope === 'REGION' ? listInspectionsByDistrict : listInspections;
      fetcher().then(setInspections).catch(() => {});
      setToastMessage('세션 ID가 발급되었습니다. 모듈 설정에 입력해 주세요.');
      setTimeout(() => setToastMessage(''), 2000);
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '세션 ID 발급에 실패했습니다.', type: 'error' } }));
    } finally {
      setIssueLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const list = inspections.filter((i) => {
      const matchesQuery = query
        ? i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.sessionId.toLowerCase().includes(query.toLowerCase()) ||
          i.location.toLowerCase().includes(query.toLowerCase())
        : true;
      return matchesQuery;
    });
    const byTime = [...list].sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sortOrder === 'asc' ? ta - tb : tb - ta;
    });
    return byTime;
  }, [inspections, query, sortOrder]);

  return (
    <div>
      <HeaderRow>
        <Title>점검 대시보드</Title>
        <Button onClick={openCreateModal}>새 점검 생성</Button>
      </HeaderRow>
      {isLoading ? (
        <div aria-busy="true" aria-live="polite" style={{ opacity: 0.8 }}>
          대시보드 데이터를 불러오는 중…
        </div>
      ) : inspections.length === 0 ? (
        <div role="status" style={{ marginTop: 16, opacity: 0.9 }}>
          등록된 작업이 없습니다. 상단의 ‘새 점검 생성’ 버튼을 눌러 작업을 등록해주세요.
        </div>
      ) : (
        <InspectionListTable
          data={filtered}
          query={query}
          onQueryChange={setQuery}
          scopeFilter={scope}
          onScopeFilterChange={setScope}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onViewReport={(id) => navigate(`/reports/${id}`)}
        />
      )}

      {isCreateOpen && (
        <ModalOverlay role="dialog" aria-modal="true" aria-label="새 점검 세션 생성" onClick={(e) => { if (e.target === e.currentTarget) closeCreateModal(); }}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>새 점검 세션 생성</ModalTitle>
            <p style={{ margin: 0 }}>
              발급된 세션 ID는 모듈의 설정 화면에 그대로 입력해 주세요.
            </p>
            <ModalRow>
              <Input placeholder="구조물 이름 (예: 온천교)" value={structureName} onChange={(e) => setStructureName(e.target.value)} />
            </ModalRow>
            {/* 지역은 /api/user/me로 내부에 보관만 하고, 두 번째 입력은 상세 주소로 사용 */}
            <ModalRow>
              <Input placeholder="상세 주소 (예: 성남시 분당구 또는 ○○구)" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
            </ModalRow>
            <ModalRow>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Input type={isSessionIdVisible ? 'text' : 'password'} readOnly value={issuedSessionId} aria-label="세션 ID" />
                <IconButton aria-label={isSessionIdVisible ? '세션 ID 숨기기' : '세션 ID 보기'} onClick={() => setIsSessionIdVisible((v) => !v)}>
                  {/* 간단한 SVG 아이콘: 눈/숨김 */}
                  {isSessionIdVisible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10.58 7.05A7 7 0 0 1 12 7c5 0 9 5 9 5a16.7 16.7 0 0 1-3.05 3.36" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M6.35 6.35A16.7 16.7 0 0 0 3 12s4 5 9 5c1.06 0 2.06-.2 3-.57" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  )}
                </IconButton>
              </div>
            </ModalRow>
            <ModalRow>
              <Button onClick={issueSessionId} disabled={issueLoading || !!issuedSessionId}>세션 ID 발급</Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (!issuedSessionId) return;
                  try {
                    await navigator.clipboard.writeText(issuedSessionId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                    setToastMessage('세션 ID가 클립보드에 복사되었습니다.');
                    setTimeout(() => setToastMessage(''), 1500);
                    } catch (e) {
                    console.error(e);
                    window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '클립보드 복사에 실패했습니다.', type: 'error' } }));
                  }
                }}
                disabled={!issuedSessionId}
              >
                {copied ? '복사됨' : '세션 ID 복사'}
              </Button>
              <div style={{ flex: 1 }} />
              <Button variant="ghost" onClick={closeCreateModal}>닫기</Button>
            </ModalRow>
          </ModalCard>
        </ModalOverlay>
      )}

      {toastMessage && <Toast role="status">{toastMessage}</Toast>}
    </div>
  );
}


