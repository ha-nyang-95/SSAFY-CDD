import type { LoadingSpinnerProps } from '../../types';

/**
 * 재사용 가능한 로딩 스피너 컴포넌트
 * 
 * 사용 예시:
 * <LoadingSpinner size="lg" text="분석 중..." />
 */
function LoadingSpinner({ 
  size = 'md', 
  color = 'blue-600',
  text 
}: LoadingSpinnerProps) {
  
  // 크기별 스타일
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin ${sizeStyles[size]}`}>
        <svg
          className={`${sizeStyles[size]} text-${color}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      
      {text && (
        <p className={`mt-2 text-gray-600 ${textSizeStyles[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner; 