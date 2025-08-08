import React from 'react';
import styled from 'styled-components';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import CrackAnalysisSummary from './CrackAnalysisSummary';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${(props) => props.theme.spacings.medium};
`;

const ModalContainer = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.radii.medium};
  border: 1px solid ${(props) => props.theme.colors.border};
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  /* 모바일에서 전체 화면에 가깝게 */
  @media (max-width: 768px) {
    max-width: none;
    max-height: 85vh;
    margin: ${(props) => props.theme.spacings.small};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacings.large};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.colors.textSecondary};
  
  &:hover {
    background-color: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textPrimary};
  }
`;

const ModalContent = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacings.large};
  overflow-y: auto;
  min-height: 0;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.textSecondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.colors.textPrimary};
  }
`;

interface CrackAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  crackData: any[];
  onCrackItemClick: (crackId: string) => void;
}

const CrackAnalysisModal: React.FC<CrackAnalysisModalProps> = ({
  isOpen,
  onClose,
  crackData,
  onCrackItemClick,
}) => {
  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 키로 모달 닫기
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 모달이 열릴 때 스크롤 방지
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>균열 분석 요약</ModalTitle>
          <CloseButton onClick={onClose} title="닫기">
            <Icon name="close" size="16px" />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <CrackAnalysisSummary
            crackData={crackData}
            onCrackItemClick={onCrackItemClick}
          />
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CrackAnalysisModal;
