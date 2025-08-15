import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './layout/Layout';
// 한국어 주석: 라우트 단위 코드 스플리팅을 위해 lazy 로드로 변경합니다.
const LoginPage = lazy(() => import('./pages/login'));
const SignupPage = lazy(() => import('./pages/signup'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const NewInspectionPage = lazy(() => import('./pages/inspections/new'));
const LiveInspectionPage = lazy(() => import('./pages/inspections/live/[id]'));
const ReportDetailPage = lazy(() => import('./pages/reports/[id]'));

// 한국어 주석: 인증이 필요한 라우트를 보호하는 간단한 가드 컴포넌트입니다.
function PrivateRoute({ element }: { element: JSX.Element }) {
  // 한국어 주석: 쿠키 기반이므로 간단하게 '/api/user/me' 호출 성공 여부로 가드하는 것이 이상적입니다.
  // 임시로는 낙관적으로 접근을 허용하고, 각 페이지에서 401일 때 로그인으로 리다이렉트됩니다.
  return element;
}

export default function App() {
  return (
    // 한국어 주석: 라우트 로딩 중 사용자 경험 향상을 위해 Suspense fallback을 제공합니다.
    <Suspense fallback={<div style={{ padding: 24 }}>페이지를 불러오는 중…</div>}>
      <Routes>
        {/* Auth routes: Layout 제외 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* App routes: Layout 포함 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
          <Route path="/inspections/new" element={<PrivateRoute element={<NewInspectionPage />} />} />
          <Route path="/inspections/live/:id" element={<PrivateRoute element={<LiveInspectionPage />} />} />
          <Route path="/reports/:id" element={<PrivateRoute element={<ReportDetailPage />} />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
