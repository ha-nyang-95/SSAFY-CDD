
import React from 'react';
import styled from 'styled-components';
import Button from '../atoms/Button';
import Text from '../atoms/Text';

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacings.medium}; /* Use theme spacing */
`;

interface UserProfileDisplayProps {
  username?: string;
  isLoggedIn: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onJoinClick?: () => void;
}

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  username,
  isLoggedIn,
  onLogout,
  onLoginClick,
  onJoinClick,
}) => {
  return (
    <UserProfileContainer>
      <Text variant="span" fontSize="1.2rem" fontWeight="normal">
        {isLoggedIn ? `환영합니다, ${username}님` : '환영합니다'}
      </Text>
      <Button $variant="header" onClick={isLoggedIn ? onLogout : onLoginClick}>
        {isLoggedIn ? '로그아웃' : '로그인'}
      </Button>
      {!isLoggedIn && onJoinClick && (
        <Button $variant="primary" onClick={onJoinClick}>
          Join
        </Button>
      )}
    </UserProfileContainer>
  );
};

export default UserProfileDisplay;
