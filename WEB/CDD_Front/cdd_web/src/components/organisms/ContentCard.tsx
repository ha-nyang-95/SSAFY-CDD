
import React from 'react';
import styled from 'styled-components';
import Text from '../atoms/Text';

const StyledContentCard = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.radii.medium};
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacings.large};
  display: flex;
  flex-direction: column;
  height: 100%; /* Added height as per mockup */
  min-height: 0; /* flex 자식 요소의 크기가 부모를 넘어서는 것을 방지 */
  overflow: hidden; /* 카드 자체는 숨김, 내부 콘텐츠에서 스크롤 처리 */
`;

const CardTitle = styled(Text)`
  font-size: 1.1rem; /* Specific size from mockup */
  font-weight: 700; /* Specific weight from mockup */
  margin-bottom: ${(props) => props.theme.spacings.medium};
  color: ${(props) => props.theme.colors.textPrimary};
  flex-shrink: 0; /* Added flex-shrink as per mockup */
`;

const CardContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
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

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, children }) => {
  return (
    <StyledContentCard>
      <CardTitle variant="h3">
        {title}
      </CardTitle>
      <CardContent>
        {children}
      </CardContent>
    </StyledContentCard>
  );
};

export default ContentCard;
