import styled from '@emotion/styled';
import type { CrackItem } from '../../api';

type Props = {
  cracks: CrackItem[];
  onSelectCrack: (c: CrackItem) => void;
};

const Box = styled.div((p) => ({
  width: '100%',
  aspectRatio: '16/9',
  background: p.theme.colors.gradients.card,
  border: p.theme.components.cards.default.border,
  borderRadius: p.theme.components.cards.default.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: p.theme.colors.primary.text_secondary,
}));

export default function Interactive3DViewer({ cracks, onSelectCrack }: Props) {
  return (
    <Box role="group" aria-label="3D 컴포지트 뷰어">
      {/* TODO: Integrate a 3D library like React Three Fiber (R3F) and Three.js here. */}
      <div>
        3D 컴포지트 결과 미리보기 (데모)
        <div style={{ height: 8 }} />
        <div>
          {cracks.map((c) => (
            <button key={c.id} onClick={() => onSelectCrack(c)} style={{ marginRight: 8 }}>
              {c.id} 선택
            </button>
          ))}
        </div>
      </div>
    </Box>
  );
}


