
import React from 'react';
import styled from 'styled-components';
import Text from '../atoms/Text';

const StyledLiveFeedContainer = styled.div`
  width: 1024px;
  height: 600px;
  background-color: ${(props) => props.theme.colors.darkSurface};
  border-radius: ${(props) => props.theme.radii.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.fontSizes.xLarge};
  font-weight: 700;
  letter-spacing: 2px;
  flex-direction: column;
  gap: 10px;
`;

const LiveIndicator = styled.span`
  color: ${(props) => props.theme.colors.danger};
  font-size: ${(props) => props.theme.fontSizes.medium};
  font-weight: bold;
`;

const LiveFeedContainer: React.FC = () => {
  return (
    <StyledLiveFeedContainer>
      <LiveIndicator>● LIVE</LiveIndicator>
      <Text variant="span" color={({ theme }) => theme.colors.surface} fontSize="1.5rem" fontWeight="700">
        실시간 드론 영상
      </Text>
    </StyledLiveFeedContainer>
  );
};

export default LiveFeedContainer;
