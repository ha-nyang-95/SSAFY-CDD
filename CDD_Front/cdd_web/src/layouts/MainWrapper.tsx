
import React from 'react';
import styled from 'styled-components';

const StyledMainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow: hidden;
`;

interface MainWrapperProps {
  children: React.ReactNode;
}

const MainWrapper: React.FC<MainWrapperProps> = ({ children }) => {
  return <StyledMainWrapper>{children}</StyledMainWrapper>;
};

export default MainWrapper;
