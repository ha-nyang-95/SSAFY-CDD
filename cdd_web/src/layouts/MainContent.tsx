
import React from 'react';
import styled from 'styled-components';

const StyledMainContent = styled.main`
  flex-grow: 1;
  display: flex;
  padding: ${(props) => props.theme.spacings.large};
  gap: ${(props) => props.theme.spacings.large};
  overflow: auto;
`;

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return <StyledMainContent>{children}</StyledMainContent>;
};

export default MainContent;
