
import React from 'react';
import styled from 'styled-components';
import Text from '../atoms/Text';

const StyledErrorMessage = styled.div`
  color: ${(props) => props.theme.colors.danger};
  font-size: 0.9rem; /* Updated font size as per mockup */
  height: 1em; /* Added height as per mockup */
  text-align: left; /* Added text-align as per mockup */
`;

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <StyledErrorMessage>
      <Text variant="span" color={({ theme }) => theme.colors.danger} fontSize="0.9rem">
        {message}
      </Text>
    </StyledErrorMessage>
  );
};

export default ErrorMessage;
