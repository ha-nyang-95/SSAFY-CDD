import styled from '@emotion/styled';
import Input from '../../components/Input';
import Button from '../../components/Button';
import type { Inspection } from '../../api/types';
import StatusPill from '../Badge';

// 한국어 주석: 한국 시간대 기준으로 날짜/시간을 포맷하는 함수
function formatKoreanDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24시간 형식 사용
    });
  } catch (error) {
    // 한국어 주석: 날짜 파싱 에러 시 원본 문자열 반환
    console.error('날짜 포맷 에러:', error);
    return dateString;
  }
}

type Props = {
  data: Inspection[];
  query: string;
  onQueryChange: (q: string) => void;
  scopeFilter: 'REGION' | 'MINE';
  onScopeFilterChange: (s: 'REGION' | 'MINE') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (o: 'asc' | 'desc') => void;
  onViewReport: (id: string) => void;
};

const Toolbar = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.md,
  alignItems: 'center',
  marginBlockEnd: p.theme.spacing.md,
  flexWrap: 'wrap',
  ['@media (max-width: 640px)']: {
    '& > *': {
      flex: '1 1 100%',
    },
  },
}));

const Table = styled.table((p) => ({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  color: p.theme.colors.primary.text_primary,
  fontSize: 'clamp(12px, 1.8vw, 16px)',
  tableLayout: 'fixed',
  ['@media (max-width: 640px)']: {
    fontSize: '14px',
  },
}));

const Th = styled.th((p) => ({
  textAlign: 'left',
  padding: `${p.theme.spacing.md} ${p.theme.spacing.lg}`,
  borderBottom: `1px solid ${p.theme.colors.neutral[200]}`,
  backgroundColor: p.theme.colors.neutral[50],
  color: p.theme.colors.primary.text_primary,
  fontWeight: 600,
  fontSize: 'clamp(12px, 1.6vw, 14px)',
  whiteSpace: 'nowrap',
}));

const Td = styled.td((p) => ({
  padding: `${p.theme.spacing.md} ${p.theme.spacing.lg}`,
  borderBottom: `1px solid ${p.theme.colors.neutral[100]}`,
  fontSize: 'clamp(12px, 1.8vw, 16px)',
  lineHeight: p.theme.typography.scales.body.lineHeight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

// 기존 StatusPill 스타일은 재사용 컴포넌트로 이동

const Select = styled.select((p) => ({
  backgroundColor: p.theme.colors.primary.background,
  color: p.theme.colors.primary.text_primary,
  border: `1px solid ${p.theme.colors.neutral[300]}`,
  borderRadius: p.theme.components.buttons.primary.borderRadius,
  padding: `${p.theme.spacing.md} ${p.theme.spacing.lg}`,
  fontSize: p.theme.typography.scales.body.fontSize,
  fontFamily: p.theme.typography.fonts.body,
  cursor: 'pointer',
  transition: p.theme.effects.transitions.normal,
  '&:focus': {
    outline: 'none',
    borderColor: p.theme.colors.primary.accent,
    boxShadow: `0 0 0 3px ${p.theme.colors.secondary.hover}`,
  },
  '&:hover': {
    borderColor: p.theme.colors.neutral[400],
  },
}));

export default function InspectionListTable({
  data,
  query,
  onQueryChange,
  scopeFilter,
  onScopeFilterChange,
  sortOrder,
  onSortOrderChange,
  onViewReport,
}: Props) {
  return (
    <div>
      <Toolbar>
        <Input
          placeholder="점검명, 세션ID, 위치 검색"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="검색"
        />
        <Select
          aria-label="범위 필터"
          value={scopeFilter}
          onChange={(e) => onScopeFilterChange(e.target.value as any)}
        >
          <option value="REGION">지역</option>
          <option value="MINE">내 작업</option>
        </Select>
        <Select
          aria-label="생성시간 정렬"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
        >
          <option value="desc">최신순</option>
          <option value="asc">오래된순</option>
        </Select>
      </Toolbar>
      <Table>
        <thead>
          <tr>
            <Th>점검명</Th>
            <Th>지역</Th>
            <Th>생성 시간</Th>
            <Th>상태</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <Td>{row.name}</Td>
              <Td>{row.location}</Td>
              <Td>{formatKoreanDateTime(row.date)}</Td>
              <Td>
                {row.status === 'COMPLETED' ? (
                  <Button size="sm" onClick={() => onViewReport(row.id)}>
                    보고서 보기
                  </Button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusPill
                      status={row.status === 'LIVE' ? 'running' : row.status === 'COMPLETED' ? 'completed' : 'scheduled'}
                      label={row.status === 'LIVE' ? '진행중' : row.status === 'COMPLETED' ? '완료' : '대기'}
                    />
                    <Button size="sm" variant="secondary" disabled onClick={() => {}} aria-disabled>
                      점검 중
                    </Button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}


