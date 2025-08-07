import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Text from '../atoms/Text';
import UserProfileDisplay from '../molecules/UserProfileDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { logout as apiLogout } from '../../services/api';
import { useMutation } from '@tanstack/react-query';

import logoImage from '../../assets/images/Checky.png'

const StyledAppHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${(props) => props.theme.spacings.large};
  height: 96px; /* Specific height from mockup */
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  flex-shrink: 0;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacings.medium};
`;

const LogoImage = styled.img`
  height: 72px; // 로고 이미지의 높이
`;

interface AppHeaderProps {
  // title: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  // title,
}) => {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    },
  });

  const handleLoginClick = () => {
    navigate('/login');
  };

  // const handleJoinClick = () => {
  //   navigate('/signup');
  // };

  return (
    <StyledAppHeader>
      <BrandContainer>
        <LogoImage src={logoImage} alt="CDD Logo" />
        <Text variant="h2" fontSize="2.0rem" color={({ theme }) => theme.colors.primary}>
          CDD: Crack Detection Drone
        </Text>
      </BrandContainer>
      <UserProfileDisplay
        username={currentUser || undefined}
        isLoggedIn={isLoggedIn}
        onLogout={() => logoutMutation.mutate()}
        onLoginClick={handleLoginClick}
      />
    </StyledAppHeader>
  );
};

export default AppHeader;
