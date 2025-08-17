import styled from '@emotion/styled';
import Button from '../../components/Button';

type Props = {
  inspectionName: string;
  date: string; // activatedAt 등 표시할 날짜
  locationArea?: string;
};

const Bar = styled.section((p) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBlock: p.theme.spacing.lg,
}));

const Title = styled.h2((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h2.fontSize,
  fontWeight: p.theme.typography.scales.h2.fontWeight,
  lineHeight: p.theme.typography.scales.h2.lineHeight,
  color: p.theme.colors.primary.text_primary,
  margin: 0,
}));

const Meta = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.lg,
  color: p.theme.colors.primary.text_secondary,
}));

export default function ReportHeader({ inspectionName, date, locationArea }: Props) {
  // 한국어 주석: "성남시분당구" 형태라면 "성남시 분당구"로 가독성 개선
  const formatArea = (area?: string): string | undefined => {
    const text = (area ?? '').trim();
    if (!text) return undefined;
    const m = text.match(/^(.*?시)(.+)$/);
    if (m) {
      const left = m[1].trim();
      const right = m[2].trim();
      return `${left} ${right}`.replace(/\s+/g, ' ').trim();
    }
    return text;
  };

  const prettyArea = formatArea(locationArea);

  return (
    <Bar>
      <div>
        <Title>{inspectionName}</Title>
        <Meta>
          <span>날짜: {new Date(date).toLocaleString()}</span>
          {prettyArea && <span>지역: {prettyArea}</span>}
        </Meta>
      </div>
      {/* PDF 내보내기 버튼은 DetailPanel로 이동 */}
    </Bar>
  );
}


