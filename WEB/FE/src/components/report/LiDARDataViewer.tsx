import styled from '@emotion/styled';
import type { LiDARDataSummary } from '../../api';

type Props = { data: LiDARDataSummary };

const Box = styled.div((p) => ({
  backgroundColor: p.theme.colors.secondary.medium,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.spacing.md,
  color: p.theme.colors.primary.text_primary,
}));

const Row = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.lg,
  marginBottom: p.theme.spacing.sm,
}));

export default function LiDARDataViewer({ data }: Props) {
  return (
    <Box aria-label="LiDAR 데이터 요약">
      <Row>
        <div>깊이: {data.crackDepthMm.toFixed(2)} mm</div>
        <div>폭: {data.crackWidthMm.toFixed(2)} mm</div>
        <div>길이: {data.crackLengthMm.toFixed(2)} mm</div>
      </Row>
      <div>포인트 수: {data.points.length}</div>
    </Box>
  );
}


