import styled from '@emotion/styled';
import type { CrackItem } from '../../api/types';
import Button from '../Button';

type Props = {
  crack: CrackItem;
  isMarking: boolean;
  onMarkCrack: (crackId: string) => void;
  onDeleteCrack: (crackId: string) => void;
};

const StatusContainer = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: 'rgba(0,0,0,0.03)',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.08)'
}));

const StatusInfo = styled.div(() => ({
  display: 'flex',
  flexDirection: 'column'
}));

const StatusTitle = styled.div(() => ({
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '8px'
}));

const StatusValue = styled.div(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}));

const StatusIcon = styled.span<{ $isConfirmed: boolean }>((p) => ({
  fontSize: '20px',
  color: p.$isConfirmed ? '#10b981' : '#f59e0b'
}));

const StatusText = styled.span<{ $isConfirmed: boolean }>((p) => ({
  fontSize: '14px',
  color: p.$isConfirmed ? '#10b981' : '#f59e0b',
  fontWeight: '500'
}));

const StatusSubtext = styled.div(() => ({
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '6px'
}));

const ActionButtons = styled.div(() => ({
  display: 'flex',
  gap: '8px'
}));

export default function CrackStatusDisplay({ 
  crack, 
  isMarking, 
  onMarkCrack, 
  onDeleteCrack 
}: Props) {
  const isCrackConfirmed = (crack: CrackItem) => crack.status === 'INACTIVE';

  return (
    <StatusContainer>
      <StatusInfo>
        <StatusTitle>상태</StatusTitle>
        <StatusValue>
          <StatusIcon $isConfirmed={isCrackConfirmed(crack)}>
            {isCrackConfirmed(crack) ? '✓' : '⚠'}
          </StatusIcon>
          <StatusText $isConfirmed={isCrackConfirmed(crack)}>
            {isCrackConfirmed(crack) ? '확인됨' : '미확인'}
          </StatusText>
        </StatusValue>
        {isCrackConfirmed(crack) && (
          <StatusSubtext>
            {crack.status === 'INACTIVE' ? '처리 완료' : crack.status}
          </StatusSubtext>
        )}
      </StatusInfo>
      <ActionButtons>
        <Button
          variant={isCrackConfirmed(crack) ? "ghost" : "primary"}
          size="sm"
          onClick={() => onMarkCrack(crack.id)}
          disabled={isMarking || isCrackConfirmed(crack)}
          isLoading={isMarking}
          style={{
            minWidth: '80px',
            ...(isCrackConfirmed(crack) && {
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            })
          }}
        >
          {isMarking ? '처리중...' : isCrackConfirmed(crack) ? '완료' : '확인'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteCrack(crack.id)}
          style={{
            minWidth: '60px',
            color: '#ef4444',
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}
        >
          삭제
        </Button>
      </ActionButtons>
    </StatusContainer>
  );
}
