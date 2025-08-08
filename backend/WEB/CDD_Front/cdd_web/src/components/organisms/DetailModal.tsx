
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import Badge from '../atoms/Badge';

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

interface CrackDetail {
  id: string;
  severity: '높음' | '중간' | '낮음';
  severityClass: 'high' | 'medium' | 'low';
  location: string;
  coordinates: string;
  dimensions: { length: string; width: string; depth: string };
  scanData: string;
  trend: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  crackDetailData: CrackDetail | null;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacings.xLarge};
  border-radius: ${(props) => props.theme.radii.large};
  width: 90%;
  max-width: 600px; /* Specific value from mockup */
  box-shadow: ${(props) => props.theme.shadows.medium};
  position: relative;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ModalTitle = styled(Text)`
  font-size: 1.5rem; /* Specific value from mockup */
  font-weight: 700; /* Specific value from mockup */
  margin-bottom: ${(props) => props.theme.spacings.large};
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacings.medium};
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${(props) => props.theme.spacings.small};

  &.full-width {
    flex-direction: column;
    align-items: flex-start;
  }

  .label {
    font-weight: 500;
    color: ${(props) => props.theme.colors.textPrimary};
  }

  .value {
    color: ${(props) => props.theme.colors.textSecondary};
  }

  .placeholder-graph {
    width: 100%;
    height: 150px;
    background-color: ${(props) => props.theme.colors.background};
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${(props) => props.theme.colors.textSecondary};
    border: 1px dashed ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.radii.small};
    margin-top: ${(props) => props.theme.spacings.small};
  }
`;

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  crackDetailData,
}) => {
  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <ModalTitle variant="h3">균열 상세 정보</ModalTitle>
        <ModalBody>
          {crackDetailData ? (
            <>
              <DetailItem>
                <span className="label">균열 ID</span>
                <span className="value">{crackDetailData.id}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">심각도</span>
                <span className="value">
                  <Badge variant={crackDetailData.severityClass}>
                    {crackDetailData.severity}
                  </Badge>
                </span>
              </DetailItem>
              <DetailItem className="full-width">
                <span className="label">정확한 위치 (좌표)</span>
                <span className="value">
                  {crackDetailData.location} ({crackDetailData.coordinates})
                </span>
              </DetailItem>
              <DetailItem>
                <span className="label">길이</span>
                <span className="value">{crackDetailData.dimensions.length}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">폭</span>
                <span className="value">{crackDetailData.dimensions.width}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">깊이</span>
                <span className="value">{crackDetailData.dimensions.depth}</span>
              </DetailItem>
              <DetailItem>
                <span className="label">변화 추이</span>
                <span className="value">{crackDetailData.trend}</span>
              </DetailItem>
              <DetailItem className="full-width">
                <span className="label">LiDAR 스캔 데이터</span>
                <span className="value">{crackDetailData.scanData}</span>
              </DetailItem>
              <DetailItem className="full-width">
                <span className="label">이력 추세 그래프</span>
                <div className="placeholder-graph">[ 이력 추세 그래프 이미지 ]</div>
              </DetailItem>
            </>
          ) : (
            <Text color={({ theme }) => theme.colors.textSecondary}>
              균열 상세 정보를 불러올 수 없습니다.
            </Text>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DetailModal;

