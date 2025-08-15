import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { createInspectionByDistrict } from '../../api/tasks';
import { me } from '../../api/auth';
// import { useNavigate } from 'react-router-dom';

const Card = styled.section((p) => ({
  backgroundColor: p.theme.components.cards.default.backgroundColor,
  borderRadius: p.theme.components.cards.default.borderRadius,
  padding: p.theme.components.cards.default.padding,
  border: p.theme.components.cards.default.border,
  backdropFilter: p.theme.components.cards.default.backdropFilter,
  maxWidth: 720,
  margin: '40px auto',
  display: 'flex',
  flexDirection: 'column',
  gap: p.theme.spacing.md,
  overflow: 'visible', // 드롭다운이 가려지지 않도록 컨테이너 오버플로우 허용
}));

const Title = styled.h2((p) => ({
  fontFamily: p.theme.typography.fonts.heading,
  fontSize: p.theme.typography.scales.h2.fontSize,
  fontWeight: p.theme.typography.scales.h2.fontWeight,
  color: p.theme.colors.primary.text_primary,
  margin: 0,
}));

const Row = styled.div((p) => ({
  display: 'flex',
  gap: p.theme.spacing.md,
  alignItems: 'center',
  flexWrap: 'wrap', // 모바일에서 줄바꿈 허용으로 버튼이 보기 좋게 배치되도록 처리
}));

// 요구사항: 지역 드롭박스 제거 → Select 컴포넌트 사용하지 않음


const CopyStatus = styled.span<{ $visible: boolean }>((p) => ({
  color: p.$visible ? p.theme.colors.primary.accent : p.theme.colors.primary.text_secondary,
  fontWeight: 700,
  fontSize: '12px',
  opacity: p.$visible ? 1 : 0,
  transition: p.theme.effects.transitions.fast,
}));


export default function NewInspectionPage() {
  // const navigate = useNavigate();
  // 폼 상태: 구조물 이름을 맨 앞에 배치, 지역은 사용자 지역으로 기본 채움
  const [structureName, setStructureName] = useState(''); // 예: 온천교
  const [province, setProvince] = useState(''); // 시/도
  const [district, setDistrict] = useState(''); // 시/군/구(자유입력)
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const didInitRef = useRef(false);

  // 한국어 주석: "성남시분당구" → "성남시 분당구"처럼 시와 하위 행정구 사이에 공백 삽입
  const normalizeDistrict = (raw: string): string => {
    const text = (raw ?? '').trim();
    if (!text) return '';
    // "○○시○○구/군/읍/면/동" 패턴에서 시 뒤에 공백이 없다면 하나 추가
    const m = text.match(/^(.*?시)(.+)$/);
    if (m) {
      const left = m[1].trim();
      const right = m[2].trim();
      return `${left} ${right}`.replace(/\s+/g, ' ').trim();
    }
    return text;
  };

  // 요구사항: 시/도 드롭박스 제거 (사용자 지역 자동 세팅만 사용)

  // 초기값 설정 (한 번만 실행): 사용자 기본 지역을 /api/user/me에서 가져와 세팅
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      try {
        const user = await me();
        // regionName 예: "서울특별시 강남구" 또는 "경기도 성남시 분당구"
        const region = (user?.regionName ?? '').trim();
        if (region) {
          // 시/도는 첫 단어, 나머지를 시/군/구로 채움 (간단 규칙)
          const [firstToken, ...rest] = region.split(/\s+/);
          setProvince(firstToken || '서울특별시');
          setDistrict(normalizeDistrict(rest.join(' ')));
        } else {
          setProvince('서울특별시');
        }
      } catch {
        setProvince('서울특별시');
      }
    })();
  }, []);

  // 지역조회/등록 버튼 제거됨 (요구사항 반영)

  // 세션 ID 발급: 사용자 지역(시/도+시군구)과 구조물 이름을 합쳐 문자열로 생성
  const issueSessionId = async () => {
    const trimmedStructure = structureName.trim();
    const trimmedDistrict = normalizeDistrict(district);
    if (!province) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '시/도를 선택해 주세요.', type: 'warning' } })); return; }
    if (!trimmedDistrict) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '시/군/구를 입력해 주세요.', type: 'warning' } })); return; }
    if (!trimmedStructure) { window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '구조물 이름을 입력해 주세요.', type: 'warning' } })); return; }
    try {
      setIsLoading(true);
      const regionFullName = `${province} ${trimmedDistrict} ${trimmedStructure}`;
      const created = await createInspectionByDistrict(regionFullName);
      setSessionId(created.sessionId);
      setErrorMessage('');
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '세션 ID 발급에 실패했습니다.', type: 'error' } }));
    } finally {
      setIsLoading(false);
    }
  };

  // 한국어 주석: 생성 버튼은 제거되어 사용하지 않습니다.

  return (
    <Card>
      <Title>새 점검 세션 생성</Title>
      <p style={{ margin: 0 }}>구조물 정보와 주소를 입력한 뒤 세션 ID를 발급하세요. 사용자 기본 지역이 자동으로 채워집니다.</p>
      {errorMessage && <p role="alert" style={{ margin: 0 }}>{errorMessage}</p>}
      <Row>
        <Input placeholder="구조물 이름 (예: 온천교)" value={structureName} onChange={(e) => setStructureName(e.target.value)} />
      </Row>
      <Row>
        <Input placeholder="시/군/구 (예: 유성구)" value={district} onChange={(e) => setDistrict(e.target.value)} />
      </Row>
      <Row>
        <Input readOnly value={sessionId} aria-label="세션 ID" />
      </Row>
      <Row>
        <Button onClick={issueSessionId} disabled={isLoading}>세션 ID 발급</Button>
        <Button
          onClick={async () => {
            if (!sessionId) return;
            try {
              await navigator.clipboard.writeText(sessionId);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch (e) {
              console.error(e);
              window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: '클립보드 복사에 실패했습니다.', type: 'error' } }));
            }
          }}
          disabled={!sessionId}
        >
          {copied ? '복사됨' : '세션 ID 복사'}
        </Button>
        <CopyStatus $visible={copied} aria-live="polite">세션 ID가 복사되었습니다</CopyStatus>
      </Row>
    </Card>
  );
}


