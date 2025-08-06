
import React from 'react';
import styled from 'styled-components';
import Text from '../atoms/Text';

const StyledContentCard = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.radii.medium};
  border: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacings.large};
  display: flex;
  flex-direction: column;
  height: 100%; /* Added height as per mockup */
`;

const CardTitle = styled(Text)`
  font-size: 1.1rem; /* Specific size from mockup */
  font-weight: 700; /* Specific weight from mockup */
  margin-bottom: ${(props) => props.theme.spacings.medium};
  color: ${(props) => props.theme.colors.textPrimary};
  flex-shrink: 0; /* Added flex-shrink as per mockup */
`;

interface ContentCardProps {
  title: string;
  children: React.ReactNode;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, children }) => {
  return (
    <StyledContentCard>
      <CardTitle variant="h3">
        {title}
      </CardTitle>
      {children}
    </StyledContentCard>
  );
};

export default ContentCard;
