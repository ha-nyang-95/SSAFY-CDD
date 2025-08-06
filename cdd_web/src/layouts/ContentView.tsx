
import React from 'react';
import styled from 'styled-components';

const StyledContentView = styled.div`
  display: flex;
  width: 100%;
  gap: ${(props) => props.theme.spacings.large};
`;

interface ContentViewProps {
  children: React.ReactNode;
}

const ContentView: React.FC<ContentViewProps> = ({ children }) => {
  return <StyledContentView>{children}</StyledContentView>;
};

export default ContentView;
