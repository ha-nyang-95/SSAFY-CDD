
import React from 'react';
import styled from 'styled-components';
import ListItem from '../molecules/ListItem';
import Text from '../atoms/Text';
import Badge from '../atoms/Badge';

interface Crack {
  id: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  severityClass: 'high' | 'medium' | 'low'; // Added severityClass as per mockup
  length: string;
  width: string;
  depth: string;
  scanData: string;
  trend: string;
  coordinates: string;
}

const ListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacings.small};
`;

const InfoContainer = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;

  strong {
    color: ${(props) => props.theme.colors.textPrimary};
    font-weight: 500;
    font-size: 1rem;
  }
`;

interface CrackAnalysisSummaryProps {
  crackData: Crack[];
  onCrackItemClick: (crackId: string) => void;
}

const CrackAnalysisSummary: React.FC<CrackAnalysisSummaryProps> = ({
  crackData,
  onCrackItemClick,
}) => {
  return (
    <ListContainer>
      {crackData.length === 0 ? (
        <Text color={({ theme }) => theme.colors.textSecondary}>균열 데이터 없음.</Text>
      ) : (
        crackData.map((crack) => (
          <ListItem key={crack.id} onClick={() => onCrackItemClick(crack.id)}>
            <InfoContainer>
              <strong>ID: {crack.id}</strong> | 위치: {crack.location}
            </InfoContainer>
            <Badge variant={crack.severityClass}>{crack.severity}</Badge>
          </ListItem>
        ))
      )}
    </ListContainer>
  );
};

export default CrackAnalysisSummary;
