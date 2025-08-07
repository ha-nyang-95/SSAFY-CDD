
import React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textPrimary}; /* Use theme text primary color */
  font-weight: 500; /* Adjusted font weight as per mockup detail-item label */
  margin-bottom: 4px; // Small margin for spacing with input
  display: block;
`;

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  ...rest
}) => {
  return (
    <StyledLabel htmlFor={htmlFor} {...rest}>
      {children}
    </StyledLabel>
  );
};

export default Label;
