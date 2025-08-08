/**
 * Suspense 래퍼 컴포넌트
 */

import React, { Suspense as ReactSuspense } from 'react';
import type { ReactNode } from 'react';
import { LoadingSpinner } from '../ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Suspense({ children, fallback }: Props) {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" text="로딩 중..." />
    </div>
  );

  return (
    <ReactSuspense fallback={fallback || defaultFallback}>
      {children}
    </ReactSuspense>
  );
} 