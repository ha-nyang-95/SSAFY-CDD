import styled from '@emotion/styled';
import Button from '../../components/Button';
import { useState } from 'react';

type Props = { onSave: (text: string) => void };

const Box = styled.div((p) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.sm,
}));

const TextArea = styled.textarea((p) => ({
  width: '100%',
  minHeight: 120,
  backgroundColor: p.theme.colors.primary.background,
  color: p.theme.colors.primary.text_primary,
  border: `1px solid ${p.theme.colors.neutral[300]}`,
  borderRadius: p.theme.components.inputs.default.borderRadius,
  padding: p.theme.spacing.md,
  fontSize: p.theme.typography.scales.body.fontSize,
  fontFamily: p.theme.typography.fonts.body,
  lineHeight: p.theme.typography.scales.body.lineHeight,
  resize: 'vertical',
  transition: p.theme.effects.transitions.normal,
  '&:focus': {
    outline: 'none',
    borderColor: p.theme.colors.primary.accent,
    boxShadow: p.theme.components.inputs.default.focusBoxShadow,
  },
  '&:hover:not(:focus)': {
    borderColor: p.theme.colors.neutral[400],
  },
  '&::placeholder': {
    color: p.theme.colors.primary.text_muted,
  },
}));

export default function MemoInput({ onSave }: Props) {
  const [value, setValue] = useState('');
  return (
    <Box>
      <TextArea value={value} onChange={(e) => setValue(e.target.value)} placeholder="현장 메모를 입력하세요 (예: 거더 하부 CRACK-001 보수 필요)" />
      <Button onClick={() => onSave(value)}>메모 저장</Button>
    </Box>
  );
}


