import React from 'react';
import styled, { CSSProperties } from 'styled-components';

// justify-content와 align-items를 props로 받을 수 있도록 interface를 정의합니다.
interface StyledContentViewProps {
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
}

const StyledContentView = styled.div<StyledContentViewProps>`
  display: flex;
  width: 100%;
  gap: ${(props) => props.theme.spacings.large};

  /* props로 받은 값으로 정렬을 동적으로 설정합니다. 값이 없으면 기본값으로 동작합니다. */
  justify-content: ${(props) => props.justifyContent || 'flex-start'};
  align-items: ${(props) => props.alignItems || 'stretch'};
  
  /* 모바일에서는 세로 레이아웃으로 변경 */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${(props) => props.theme.spacings.medium};
  }
`;

// 컴포넌트가 받을 props 타입을 확장합니다.
interface ContentViewProps extends StyledContentViewProps {
  children: React.ReactNode;
  style?: React.CSSProperties; // 다른 곳에서 사용될 수 있는 style prop도 명시적으로 추가
}

const ContentView: React.FC<ContentViewProps> = ({ children, justifyContent, alignItems, style }) => {
  // 받은 props를 StyledContentView로 전달합니다.
  return (
    <StyledContentView justifyContent={justifyContent} alignItems={alignItems} style={style}>
      {children}
    </StyledContentView>
  );
};

export default ContentView;