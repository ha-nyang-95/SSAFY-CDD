import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/routes';
import { AuthProvider } from './contexts/auth';
import { ResponsiveProvider } from './contexts/responsive';

function App() {
  return (
    <ResponsiveProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* 메인 콘텐츠 */}
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ResponsiveProvider>
  );
}

export default App; 