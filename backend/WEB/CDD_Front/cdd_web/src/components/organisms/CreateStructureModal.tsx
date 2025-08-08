
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import Input from '../atoms/Input';

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

interface CreateStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; location: string; link: string }) => void;
  onGenerateLink: () => Promise<string>;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacings.xLarge};
  border-radius: ${(props) => props.theme.radii.large};
  width: 90%;
  max-width: 600px; /* Specific value from mockup */
  box-shadow: ${(props) => props.theme.shadows.medium};
  position: relative;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ModalTitle = styled(Text)`
  font-size: 1.5rem; /* Specific value from mockup */
  font-weight: 700; /* Specific value from mockup */
  margin-bottom: ${(props) => props.theme.spacings.large};
`;

const ModalBody = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacings.medium};
`;

const ModalInputGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacings.small};
`;

const ModalFooter = styled.div`
  margin-top: ${(props) => props.theme.spacings.large};
  text-align: right;
`;

const CreateStructureModal: React.FC<CreateStructureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onGenerateLink,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');

  const handleGenerateLink = async () => {
    const generatedLink = await onGenerateLink();
    setLink(generatedLink);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, location, link });
    setName('');
    setLocation('');
    setLink('');
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>
        <ModalTitle variant="h3">신규 구조물 생성</ModalTitle>
        <ModalBody onSubmit={handleSubmit}>
          <Input
            id="structure-name"
            type="text"
            placeholder="구조물 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="structure-location"
            type="text"
            placeholder="위치"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <ModalInputGroup>
            <Input
              id="structure-link"
              type="text"
              placeholder="3D 모델 링크"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              readOnly
            />
            <Button type="button" variant="secondary" onClick={handleGenerateLink}>
              링크 생성
            </Button>
          </ModalInputGroup>
          <ModalFooter>
            <Button type="submit" variant="primary">
              저장
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateStructureModal;
