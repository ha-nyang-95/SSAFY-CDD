
import React from 'react';
import styled from 'styled-components';

const StyledModalInputGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacings.small}; /* Use theme spacing for gap */
`;

interface ModalInputGroupProps {
  children: React.ReactNode;
}

const ModalInputGroup: React.FC<ModalInputGroupProps> = ({ children }) => {
  return <StyledModalInputGroup>{children}</StyledModalInputGroup>;
};

export default ModalInputGroup;
