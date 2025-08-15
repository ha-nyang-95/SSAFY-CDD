import styled from '@emotion/styled';
import type { CrackItem } from '../../api/types';
import Button from '../Button';
import { formatCrackId } from '../../utils/mappers';

type Props = {
  cracks: CrackItem[];
  onSelectCrack: (crack: CrackItem) => void;
};

const List = styled.ul(() => ({
  padding: 0,
  margin: 0,
  listStyle: 'none',
}));

const Item = styled.li((p) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${p.theme.spacing.md} 0`,
  borderBottom: `1px solid ${p.theme.colors.neutral[100]}`,
  cursor: 'pointer',
  '&:hover': {
    background: 'transparent',
    opacity: 0.85,
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const StatusBadge = styled.div<{ $isConfirmed: boolean }>((p) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: p.$isConfirmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
  borderRadius: '12px',
  border: `1px solid ${p.$isConfirmed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
}));

const StatusText = styled.span<{ $isConfirmed: boolean }>((p) => ({
  fontSize: '11px',
  color: p.$isConfirmed ? '#10b981' : '#f59e0b',
  fontWeight: '500'
}));

const ConfirmedLabel = styled.span(() => ({
  fontSize: '11px',
  color: '#10b981',
  marginLeft: '8px',
  fontWeight: '500'
}));

export default function CrackList({ cracks, onSelectCrack }: Props) {
  const isCrackConfirmed = (crack: CrackItem) => crack.status === 'INACTIVE';

  return (
    <List>
      {cracks.map((crack) => (
        <Item 
          key={crack.id} 
          onClick={() => onSelectCrack(crack)} 
          role="button" 
          aria-label={`균열 ${formatCrackId(crack.crackName)} 상세 보기`}
          style={{
            opacity: isCrackConfirmed(crack) ? 0.7 : 1,
            backgroundColor: isCrackConfirmed(crack) ? 'rgba(0,0,0,0.02)' : 'transparent'
          }}
        >
          <div>
            <strong>{formatCrackId(crack.crackName)}</strong> — {crack.label}
            {isCrackConfirmed(crack) && (
              <ConfirmedLabel>✓ 확인됨</ConfirmedLabel>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <StatusBadge $isConfirmed={isCrackConfirmed(crack)}>
              <span style={{ 
                fontSize: '12px',
                color: isCrackConfirmed(crack) ? '#10b981' : '#f59e0b'
              }}>
                {isCrackConfirmed(crack) ? '✓' : '⚠'}
              </span>
              <StatusText $isConfirmed={isCrackConfirmed(crack)}>
                {isCrackConfirmed(crack) ? '확인' : '미확인'}
              </StatusText>
            </StatusBadge>
            <Button size="sm" variant={isCrackConfirmed(crack) ? "ghost" : "primary"}>
              {isCrackConfirmed(crack) ? '보기' : '선택'}
            </Button>
          </div>
        </Item>
      ))}
    </List>
  );
}
