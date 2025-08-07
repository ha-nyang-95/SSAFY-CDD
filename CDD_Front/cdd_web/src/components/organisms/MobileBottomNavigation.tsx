import React from 'react';
import styled from 'styled-components';
import Icon from '../atoms/Icon';
import Text from '../atoms/Text';

const StyledMobileBottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${(props) => props.theme.colors.surface};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${(props) => props.theme.spacings.small} 0;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  
  /* 모바일에서만 표시 */
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavItem = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: ${(props) => props.theme.spacings.small};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  
  /* 활성 상태 스타일 */
  color: ${(props) => 
    props.$isActive 
      ? props.theme.colors.primary 
      : props.theme.colors.textSecondary
  };
  
  /* 터치 친화적인 크기 보장 */
  min-height: 44px;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const NavText = styled(Text)<{ $isActive: boolean }>`
  font-size: 0.75rem;
  font-weight: ${(props) => props.$isActive ? '600' : '400'};
  color: inherit;
`;

interface MobileBottomNavigationProps {
  activeView: 'realTime' | 'threeDModel' | 'structureManagement';
  onNavClick: (view: 'realTime' | 'threeDModel' | 'structureManagement') => void;
}

const NAV_ITEMS = [
  {
    key: 'realTime' as const,
    iconName: 'video',
    label: '실시간',
  },
  {
    key: 'threeDModel' as const,
    iconName: '3d-model', 
    label: '3D 모델',
  },
  {
    key: 'structureManagement' as const,
    iconName: 'structure',
    label: '구조물 관리',
  },
];

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  activeView,
  onNavClick,
}) => {
  return (
    <StyledMobileBottomNav>
      {NAV_ITEMS.map(({ key, iconName, label }) => (
        <NavItem
          key={key}
          $isActive={activeView === key}
          onClick={() => onNavClick(key)}
          type="button"
        >
          <Icon name={iconName} size="20px" />
          <NavText $isActive={activeView === key}>
            {label}
          </NavText>
        </NavItem>
      ))}
    </StyledMobileBottomNav>
  );
};

export default MobileBottomNavigation;
