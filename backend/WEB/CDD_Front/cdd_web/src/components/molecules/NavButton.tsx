
import React from 'react';
import styled, { css } from 'styled-components';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Text from '../atoms/Text';

// 1. NavButton에 특화된 새로운 스타일 컴포넌트를 정의합니다.
const StyledNavButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 24px; // 충분한 내부 여백
  gap: 16px; // 아이콘과 텍스트 사이 간격

  background-color: transparent;
  border: none;
  border-radius: ${(props) => props.theme.radii.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  // 텍스트 색상을 isActive 상태에 따라 동적으로 변경
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.background /* 활성: 순백색 (최대 대비) */
      : 'rgba(255, 255, 255, 0.7)'}; /* 비활성: 반투명 흰색 (대비 유지하며 구분) */
  
  // 아이콘 색상도 텍스트 색상과 동일하게 설정
  svg {
    fill: currentColor; 
  }

  // 2. 활성화 및 호버 상태의 스타일을 명확히 합니다.
  ${(props) =>
    props.$isActive &&
    css`
      background-color: rgba(255, 255, 255, 0.15);
    `}

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${(props) => props.theme.colors.background}; /* 호버 시 텍스트를 더 밝게 */
  }
`;

interface NavButtonProps {
  iconName: IconName; // Icon 컴포넌트에서 IconName 타입을 export해서 사용한다고 가정
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({
  iconName,
  label,
  isActive,
  onClick,
}) => {
  return (
    <StyledNavButton $isActive={isActive} onClick={onClick}>
      <Icon name={iconName} size="24px" />
      <Text variant="span" fontSize="1rem" fontWeight="500">
        {label}
      </Text>
    </StyledNavButton>
  );
};

export default NavButton;
