
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import liveGif from '../../assets/images/Live.gif';

const StyledLiveFeedContainer = styled.div<{ $isFullscreen: boolean }>`
  width: 80%;
  max-width: 1024px;
  aspect-ratio: 16 / 9;
  background-color: ${(props) => props.theme.colors.darkSurface};
  border-radius: ${(props) => props.theme.radii.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.surface};
  font-size: ${(props) => props.theme.fontSizes.xLarge};
  font-weight: 700;
  letter-spacing: 2px;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
  
  /* 전체화면 모드 */
  ${({ $isFullscreen }) =>
    $isFullscreen &&
    `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    max-width: none;
    border-radius: 0;
    z-index: 9999;
  `}
  
  /* 모바일에서 더 적절한 크기로 조정 */
  @media (max-width: 768px) {
    width: 95%;
    font-size: ${(props) => props.theme.fontSizes.large};
    letter-spacing: 1px;
    gap: 8px;
  }
`;

const LiveVideo = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
`;

const LiveOverlay = styled.div<{ $show: boolean }>`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  padding: ${(props) => props.theme.spacings.large};
  border-radius: ${(props) => props.theme.radii.medium};
  backdrop-filter: blur(4px);
  opacity: ${({ $show }) => ($show ? '1' : '0')};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transition: opacity 0.5s ease, visibility 0.5s ease;
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: ${(props) => props.theme.spacings.medium};
  }
`;

const LiveIndicator = styled.span`
  color: ${(props) => props.theme.colors.danger};
  font-size: ${(props) => props.theme.fontSizes.medium};
  font-weight: bold;
`;

const FullscreenButton = styled(Button)`
  position: absolute;
  top: ${(props) => props.theme.spacings.medium};
  right: ${(props) => props.theme.spacings.medium};
  display: none;
  
  /* 모바일에서만 표시 */
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
`;

const ExitFullscreenButton = styled(Button)<{ $show: boolean }>`
  position: absolute;
  bottom: ${(props) => props.theme.spacings.medium};
  right: ${(props) => props.theme.spacings.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  opacity: ${({ $show }) => ($show ? '1' : '0')};
  visibility: ${({ $show }) => ($show ? 'visible' : 'hidden')};
  transform: ${({ $show }) => ($show ? 'scale(1)' : 'scale(0.8)')};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: ${({ $show }) => ($show ? 'scale(1.05)' : 'scale(0.8)')};
  }
`;

const LiveFeedContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const exitButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        // 모바일에서 가로 모드로 회전 유도
        if (screen.orientation) {
          try {
            await screen.orientation.lock('landscape');
          } catch (error) {
            // orientation lock이 지원되지 않는 경우 무시
            console.log('Orientation lock not supported');
          }
        }
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setShowExitButton(false);
        // 타이머 정리
        if (exitButtonTimeoutRef.current) {
          clearTimeout(exitButtonTimeoutRef.current);
          exitButtonTimeoutRef.current = null;
        }
        // 화면 방향 잠금 해제
        if (screen.orientation) {
          try {
            screen.orientation.unlock();
          } catch (error) {
            console.log('Orientation unlock not supported');
          }
        }
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  // 영상 로드 완료 시 오버레이 숨김 처리
  const handleVideoLoad = () => {
    // 영상이 로드되면 2초 후에 오버레이 페이드아웃
    setTimeout(() => {
      setIsVideoLoaded(true);
    }, 2000);
  };

  // 전체화면 모드에서 영상 터치 시 나가기 버튼 표시
  const handleVideoTouch = () => {
    if (!isFullscreen) return;
    
    setShowExitButton(true);
    
    // 기존 타이머가 있다면 클리어
    if (exitButtonTimeoutRef.current) {
      clearTimeout(exitButtonTimeoutRef.current);
    }
    
    // 3초 후 자동으로 버튼 숨김
    exitButtonTimeoutRef.current = setTimeout(() => {
      setShowExitButton(false);
    }, 3000);
  };

  // 전체화면 변경 감지
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // 전체화면에서 나갈 때 버튼 숨김과 타이머 정리
      if (!isCurrentlyFullscreen) {
        setShowExitButton(false);
        if (exitButtonTimeoutRef.current) {
          clearTimeout(exitButtonTimeoutRef.current);
          exitButtonTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // 컴포넌트 언마운트 시 타이머 정리
      if (exitButtonTimeoutRef.current) {
        clearTimeout(exitButtonTimeoutRef.current);
      }
    };
  }, []);

  return (
    <StyledLiveFeedContainer 
      ref={containerRef} 
      $isFullscreen={isFullscreen}
      onClick={handleVideoTouch}
      onTouchStart={handleVideoTouch}
    >
      {/* 실시간 드론 영상 GIF */}
      <LiveVideo 
        src={liveGif} 
        alt="실시간 드론 영상"
        onLoad={handleVideoLoad}
      />
      
      {/* 오버레이 (LIVE 인디케이터 및 텍스트) - 영상 로드 전까지만 표시 */}
      <LiveOverlay $show={!isVideoLoaded}>
        <LiveIndicator>● LIVE</LiveIndicator>
        <Text variant="span" color={({ theme }) => theme.colors.surface} fontSize="1.5rem" fontWeight="700">
          실시간 드론 영상
        </Text>
      </LiveOverlay>
      
      {/* 전체화면 버튼 (모바일에서만 표시) */}
      {!isFullscreen && (
        <FullscreenButton 
          onClick={(e) => {
            e.stopPropagation();
            handleFullscreen();
          }} 
          title="전체화면"
        >
          <Icon name="fullscreen" size="20px" />
        </FullscreenButton>
      )}
      
      {/* 전체화면 나가기 버튼 (터치 시에만 표시) */}
      <ExitFullscreenButton 
        $show={showExitButton}
        onClick={(e) => {
          e.stopPropagation();
          handleExitFullscreen();
        }} 
        title="전체화면 종료"
      >
        <Icon name="close" size="20px" />
      </ExitFullscreenButton>
    </StyledLiveFeedContainer>
  );
};

export default LiveFeedContainer;
