import React from 'react';
import styled from 'styled-components';

const StyledMainContent = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column; /* 자식 요소들을 세로 방향으로 정렬하도록 변경 */
  padding: ${(props) => props.theme.spacings.large};
  gap: ${(props) => props.theme.spacings.large};
  overflow: auto;
  
  /* 모바일에서는 하단 네비게이션 공간 확보 */
  @media (max-width: 768px) {
    padding-bottom: calc(${(props) => props.theme.spacings.large} + 70px);
  }
`;

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return <StyledMainContent>{children}</StyledMainContent>;
};

export default MainContent;