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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 ${(props) => props.theme.spacings.large};
  height: 96px; /* Specific height from mockup */
  background-color: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  flex-shrink: 0;
  
  /* 모바일에서 높이와 패딩 조정 */
  @media (max-width: 768px) {
    height: 70px;
    padding: 0 ${(props) => props.theme.spacings.medium};
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
`;

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-self: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
`;

const LogoImage = styled.img`
  height: 72px; // 로고 이미지의 높이
  
  /* 모바일에서 로고 크기 조정 */
  @media (max-width: 768px) {
    height: 50px;
  }
`;

const FullBrandText = styled(Text)`
  /* 데스크톱에서만 전체 텍스트 표시 */
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileBrandText = styled(Text)`
  /* 모바일에서만 축약된 텍스트 표시 */
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
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
      <LeftSection>
        <LogoImage src={logoImage} alt="CDD Logo" />
      </LeftSection>
      
      <CenterSection>
        <FullBrandText variant="h2" fontSize="2.0rem" color={({ theme }) => theme.colors.primary}>
          CDD: Crack Detection Drone
        </FullBrandText>
        <MobileBrandText variant="h2" fontSize="1.5rem" color={({ theme }) => theme.colors.primary}>
          CDD
        </MobileBrandText>
      </CenterSection>
      
      <RightSection>
        <UserProfileDisplay
          username={currentUser || undefined}
          isLoggedIn={isLoggedIn}
          onLogout={() => logoutMutation.mutate()}
          onLoginClick={handleLoginClick}
        />
      </RightSection>
    </StyledAppHeader>
  );
};

export default AppHeader;
