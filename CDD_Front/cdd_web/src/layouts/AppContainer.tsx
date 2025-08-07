
import React from 'react';
import styled from 'styled-components';

const StyledAppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* Specific height from mockup */
`;

interface AppContainerProps {
  children: React.ReactNode;
}

const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  return <StyledAppContainer>{children}</StyledAppContainer>;
};

export default AppContainer;
