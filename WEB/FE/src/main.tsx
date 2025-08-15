import { StrictMode, Fragment, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AppThemeProvider } from './theme';
import styled from '@emotion/styled';
import type { CSSObject, Theme } from '@emotion/react';
// 한국어 주석: 모델 뷰어 웹 컴포넌트가 미등록인 경우 CDN으로 안전하게 로드합니다.
(() => {
  try {
    const isModelViewerDefined = typeof window !== 'undefined' && !!customElements.get('model-viewer');
    if (!isModelViewerDefined) {
      const cdnScriptElement = document.createElement('script');
      // 한국어 주석: ESM 모듈로 로드하여 최신 브라우저에서 동작하도록 합니다.
      cdnScriptElement.type = 'module';
      cdnScriptElement.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      cdnScriptElement.crossOrigin = 'anonymous';
      cdnScriptElement.onerror = () => {
        // 한국어 주석: 로드 실패 시 콘솔에 에러를 남겨 디버깅에 도움을 줍니다.
        // 배포 환경에서도 사용자 화면이 죽지 않도록 사이드 이펙트 없는 로깅만 수행합니다.
        console.error('[model-viewer] CDN 로드 실패');
      };
      document.head.appendChild(cdnScriptElement);
    }
  } catch (unknownError) {
    // 한국어 주석: 예외 상황에서도 앱 크래시를 막기 위해 방어적으로 처리합니다.
    console.error('[model-viewer] 초기화 중 예외 발생', unknownError);
  }
})();

// 한국어 주석: 개발 모드에서 StrictMode의 의도적인 이중 마운트로 인한 API 중복 호출을 방지하기 위해
// StrictMode는 프로덕션에서만 적용합니다. (프로덕션 빌드에서는 이중 마운트가 발생하지 않음)
const RootWrapper = import.meta.env.PROD ? StrictMode : Fragment;

// 한국어 주석: 전역 토스트 호스트. 어디서든 CustomEvent('app:toast')를 디스패치하면 토스트가 표시됩니다.
type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPayload = { message: string; type?: ToastType; durationMs?: number };

type ToastItem = { id: number; message: string; type: ToastType; durationMs: number };

const ToastStack = styled.div((_: { theme: Theme }): CSSObject => ({
  position: 'fixed',
  right: 20,
  bottom: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  zIndex: 9999,
}));

const ToastCard = styled.div<{ $type: ToastType }>((p: { theme: Theme; $type: ToastType }): CSSObject => ({
  backgroundColor: p.theme.components.cards.elevated.backgroundColor,
  color: p.theme.colors.primary.text_primary,
  border: `1px solid ${p.theme.colors.neutral[200]}`,
  borderLeft: `4px solid ${(
    {
      info: p.theme.colors.semantic.info,
      success: p.theme.colors.semantic.success,
      warning: p.theme.colors.semantic.warning,
      error: p.theme.colors.semantic.error,
    } as Record<ToastType, string>
  )[p.$type]}`,
  borderRadius: 12,
  boxShadow: p.theme.effects.shadows.modal,
  padding: '10px 14px',
  minWidth: 260,
  maxWidth: 420,
  pointerEvents: 'auto',
  transform: 'translateY(0)',
  transition: 'all 0.2s ease',
}));

function GlobalToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  useEffect(() => {
    const onToast = (e: Event) => {
      const ce = e as CustomEvent<ToastPayload>;
      const payload = ce.detail || { message: '' };
      const message = String(payload.message || '');
      if (!message) return;
      const type: ToastType = payload.type ?? 'info';
      const durationMs = payload.durationMs ?? 2200;
      const id = idRef.current++;
      setToasts((prev) => [...prev, { id, message, type, durationMs }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, Math.max(1200, durationMs));
    };
    window.addEventListener('app:toast' as any, onToast);
    return () => window.removeEventListener('app:toast' as any, onToast);
  }, []);

  if (toasts.length === 0) return null;
  return (
    <ToastStack>
      {toasts.map((t) => (
        <ToastCard key={t.id} role="status" aria-live="polite" $type={t.type}>
          {t.message}
        </ToastCard>
      ))}
    </ToastStack>
  );
}

createRoot(document.getElementById('root')!).render(
  <RootWrapper>
    <AppThemeProvider>
      <GlobalToastHost />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </AppThemeProvider>
  </RootWrapper>,
);
