import Button from '../Button';
import { formatCrackId } from '../../utils/mappers';

type Props = {
  crackId: string;
  crackLabel: string;
  isVisible: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteConfirmDialog({ 
  crackId, 
  crackLabel, 
  isVisible, 
  isDeleting, 
  onConfirm, 
  onCancel 
}: Props) {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          균열 삭제 확인
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          균열 <strong>{formatCrackId(crackLabel)}</strong> (ID: {crackId})을(를) 삭제하시겠습니까?<br />
          이 작업은 되돌릴 수 없습니다.
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            isLoading={isDeleting}
            style={{
              backgroundColor: '#ef4444',
              borderColor: '#ef4444'
            }}
          >
            {isDeleting ? '삭제중...' : '삭제'}
          </Button>
        </div>
      </div>
    </div>
  );
}
