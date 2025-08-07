
import React from 'react';
import styled from 'styled-components';

const StyledAuthLayout = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.theme.colors.background};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  transition: opacity 0.3s;
`;

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return <StyledAuthLayout>{children}</StyledAuthLayout>;
};

export default AuthLayout;
