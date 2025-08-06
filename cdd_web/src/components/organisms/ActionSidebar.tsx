
import React from 'react';
import styled from 'styled-components';
import NavButton from '../molecules/NavButton';

const StyledActionSidebar = styled.aside`
  width: 220px;
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${(props) => props.theme.spacings.large} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Specific value from mockup */
  flex-shrink: 0;
`;

interface ActionSidebarProps {
  activeView: 'realTime' | 'threeDModel' | 'structureManagement';
  onNavClick: (view: 'realTime' | 'threeDModel' | 'structureManagement') => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  activeView,
  onNavClick,
}) => {
  return (
    <StyledActionSidebar>
      <NavButton
        iconName="video"
        label="실시간 모니터링"
        isActive={activeView === 'realTime'}
        onClick={() => onNavClick('realTime')}
      />
      <NavButton
        iconName="3d-model"
        label="3D 모델 시각화"
        isActive={activeView === 'threeDModel'}
        onClick={() => onNavClick('threeDModel')}
      />
      <NavButton
        iconName="structure"
        label="구조물 관리"
        isActive={activeView === 'structureManagement'}
        onClick={() => onNavClick('structureManagement')}
      />
    </StyledActionSidebar>
  );
};

export default ActionSidebar;
