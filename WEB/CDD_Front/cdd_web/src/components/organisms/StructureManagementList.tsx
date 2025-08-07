import React from 'react';
import styled from 'styled-components';
import ListItem from '../molecules/ListItem';
import Text from '../atoms/Text';
import Button from '../atoms/Button';

interface Structure {
  id: string;
  name: string;
  location: string;
  link: string;
}

// 1. 전체를 감싸는 컴포넌트를 카드 스타일로 변경합니다.
const StructureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${(props) => props.theme.spacings.large};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

// 2. 카드 내부의 헤더 스타일을 정의합니다.
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacings.medium};
  flex-shrink: 0;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacings.small};
`;

const ItemCount = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
`;

const ListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

// 3. ListItem의 스타일을 컴포넌트로 분리하여 재사용성과 일관성을 높입니다.
const StyledListItem = styled(ListItem)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${(props) => props.theme.spacings.medium} 0;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacings.small};
`;

const StructureName = styled.strong`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
`;

const StructureDetail = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};

  a {
    color: ${(props) => props.theme.colors.accent};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface StructureManagementListProps {
  structures: Structure[];
  onCreateStructureClick: () => void;
}

const StructureManagementList: React.FC<StructureManagementListProps> = ({
  structures,
  onCreateStructureClick,
}) => {
  return (
    // 4. 새로운 JSX 구조를 적용합니다.
    <StructureCard>
      <CardHeader>
        <HeaderTitle>
          <Text variant="h2">구조물</Text>
          <ItemCount>({structures.length}개)</ItemCount>
        </HeaderTitle>
        <Button $variant="primary" size="md" onClick={onCreateStructureClick}>
          생성
        </Button>
      </CardHeader>
      <ListContainer>
        {structures.length === 0 ? (
          <Text color={({ theme }) => theme.colors.textSecondary} style={{ textAlign: 'center', paddingTop: '40px' }}>
            등록된 구조물이 없습니다.
          </Text>
        ) : (
          structures.map((structure) => (
            <StyledListItem key={structure.id}>
              <InfoContainer>
                <StructureName>{structure.name}</StructureName>
                <StructureDetail>위치: {structure.location}</StructureDetail>
                <StructureDetail>
                  링크: <a href={structure.link} target="_blank" rel="noopener noreferrer">{structure.link}</a>
                </StructureDetail>
              </InfoContainer>
            </StyledListItem>
          ))
        )}
      </ListContainer>
    </StructureCard>
  );
};

export default StructureManagementList;