import styled from '@emotion/styled';
import { useEffect } from 'react';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  title?: string;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>((p) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: p.$isOpen ? 'flex' : 'none',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}));

const ModalContent = styled.div((p) => ({
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.spacing.lg,
  maxWidth: '600px',
  width: '90%',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: p.theme.effects.shadows.xl,
  position: 'relative',
}));

const ModalHeader = styled.div((p) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: p.theme.spacing.md,
  paddingBottom: p.theme.spacing.sm,
  borderBottom: `1px solid ${p.theme.colors.neutral[200]}`,
}));

const ModalTitle = styled.h2((p) => ({
  margin: 0,
  fontSize: p.theme.typography.scales.h2.fontSize,
  fontWeight: p.theme.typography.scales.h2.fontWeight,
  lineHeight: p.theme.typography.scales.h2.lineHeight,
  color: p.theme.colors.primary.text_primary,
}));

const CloseButton = styled.button((p) => ({
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: p.theme.colors.primary.text_secondary,
  padding: p.theme.spacing.xs,
  borderRadius: p.theme.components.buttons.primary.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s ease',
  
  '&:hover': {
    backgroundColor: p.theme.colors.secondary.hover,
  },
}));

const DescriptionContent = styled.div((p) => ({
  fontSize: p.theme.typography.scales.body.fontSize,
  lineHeight: 1.6,
  color: p.theme.colors.primary.text_primary,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const EmptyDescription = styled.div((p) => ({
  textAlign: 'center',
  padding: p.theme.spacing.xl,
  color: p.theme.colors.primary.text_secondary,
  fontStyle: 'italic',
}));

// 마크다운 문법을 HTML로 변환하는 함수
const markdownToHtml = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
};

// JSON 문자열을 사용자가 읽기 좋게 파싱하는 함수
const parseDescription = (text: string): string => {
  if (!text || !text.trim()) {
    return '';
  }
  
  try {
    const trimmed = text.trim();
    
    // 여러 JSON 객체가 줄바꿈으로 구분되어 있는지 확인
    const jsonStrings = trimmed.split('\n').filter(s => s.trim());
    
    if (jsonStrings.length > 1) {
      // 여러 JSON 객체가 있는 경우
      const parsedObjects: any[] = [];
      
      for (let i = 0; i < jsonStrings.length; i++) {
        const jsonStr = jsonStrings[i].trim();
        if (jsonStr.startsWith('{') || jsonStr.startsWith('[')) {
          try {
            const parsed = JSON.parse(jsonStr);
            if (typeof parsed === 'object' && parsed !== null) {
              parsedObjects.push(parsed);
            }
          } catch (parseError) {
            // 파싱 실패 시 해당 객체는 건너뜀
          }
        }
      }
      
      if (parsedObjects.length > 0) {
        // 모든 파싱된 객체를 하나로 합쳐서 표시
        const result = parsedObjects.map((obj, index) => {
          const objResult = Object.entries(obj)
            .map(([key, value]) => {
              let displayKey = key;
              let displayValue = value;
              
              // crackName을 id로 변경하고 crack_ 접두사 제거
              if (key === 'crackName' && typeof value === 'string') {
                displayKey = 'id';
                displayValue = value.replace('crack_', '');
              }
              
              const formattedValue = typeof displayValue === 'object' 
                ? JSON.stringify(displayValue, null, 2) 
                : String(displayValue);
              return `**${displayKey}**: ${formattedValue}`;
            })
            .join('\n');
          
          return `**=== 메모 ${index + 1} ===**\n${objResult}`;
        }).join('\n\n');
        
        return result;
      }
    } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      // 단일 JSON 객체인 경우 (기존 로직)
      try {
        const parsed = JSON.parse(trimmed);
        
        if (typeof parsed === 'object' && parsed !== null) {
          if (Array.isArray(parsed)) {
            const result = parsed.map((item, index) => `${index + 1}. ${JSON.stringify(item, null, 2)}`).join('\n\n');
            return result;
          } else {
            const result = Object.entries(parsed)
              .map(([key, value]) => {
                let displayKey = key;
                let displayValue = value;
                
                // crackName을 id로 변경하고 crack_ 접두사 제거
                if (key === 'crackName' && typeof value === 'string') {
                  displayKey = 'id';
                  displayValue = value.replace('crack_', '');
                }
                
                const formattedValue = typeof displayValue === 'object' 
                  ? JSON.stringify(displayValue, null, 2) 
                  : String(displayValue);
                return `**${displayKey}**: ${formattedValue}`;
              })
              .join('\n');
            
            return result;
          }
        }
      } catch (parseError) {
        return text;
      }
    }
    
    // JSON 형태가 아니면 원본 반환
    return text;
  } catch (error) {
    return text;
  }
};

export default function DescriptionModal({ 
  isOpen, 
  onClose, 
  description, 
  title = '작업 노트' 
}: DescriptionModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 모달 외부 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const parsedDescription = parseDescription(description);

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="닫기">
            ×
          </CloseButton>
        </ModalHeader>
        
        {parsedDescription && parsedDescription.trim() ? (
          <DescriptionContent
            dangerouslySetInnerHTML={{ 
              __html: markdownToHtml(parsedDescription) 
            }}
          />
        ) : (
          <EmptyDescription>
            등록된 노트가 없습니다.
          </EmptyDescription>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}