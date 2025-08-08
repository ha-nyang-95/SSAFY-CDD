import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* ------------------------- */
  /* --- 1. 기본 및 디자인 시스템 --- */
  /* ------------------------- */

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 16px;
    line-height: 1.5; /* 가독성을 위한 기본 줄 간격 추가 */
    overflow: hidden;
  }

  .hidden {
    display: none !important;
  }

  /* ------------------------- */
  /* --- 2. 레이아웃 및 뷰 --- */
  /* ------------------------- */
  .app-container {
    display: flex;
    height: 100vh;
  }

  .main-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100vh;
  }

  #dashboard-view {
    height: 100%;
  }

  /* ------------------------- */
  /* --- 3. 헤더 (Header) --- */
  /* ------------------------- */
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 64px;
    background-color: ${({ theme }) => theme.colors.surface}; /* ⭐️ CSS 변수 대신 theme 사용으로 수정 권장 */
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    flex-shrink: 0;
  }

  .app-header .title {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }

  .app-header .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* ------------------------- */
  /* --- 4. 액션 사이드바 (Action Sidebar) --- */
  /* ------------------------- */
  .action-sidebar {
    width: 80px;
    background-color: var(--primary-color);
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
  }

  /* ------------------------- */
  /* --- 5. 메인 컨텐츠 (Main Content) --- */
  /* ------------------------- */
  .main-content {
    flex-grow: 1;
    display: flex;
    padding: 24px;
    gap: 24px;
    overflow: auto;
  }

  .content-view {
    display: flex;
    width: 100%;
    gap: 24px;
  }
  
  .content-card {
    background-color: var(--surface-color);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .content-card-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text-primary-color);
    flex-shrink: 0;
  }

  /* 실시간 모니터링 뷰 */
  #real-time-view {
    justify-content: center;
    align-items: center;
  }

  #live-feed-container {
    width: 100%;
    max-width: 1024px;
    aspect-ratio: 1024 / 600;
    background-color: var(--dark-surface-color);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 2px;
    flex-direction: column;
    gap: 10px;
  }

  #live-feed-container .live-indicator {
    color: var(--danger-color);
    font-size: 1rem;
    font-weight: bold;
  }
  
  /* 3D 모델 뷰 */
  .left-column { flex: 7; }
  .right-column { flex: 3; }

  #viewer-3d-container {
    justify-content: center;
    align-items: center;
    background-color: #E2E8F0;
    border: 2px dashed var(--border-color);
    color: var(--text-secondary-color);
    font-weight: 500;
    font-size: 1.2rem;
  }

  .list-container {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
  }

  .list-item {
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.2s ease-in-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .crack-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-color: var(--primary-color);
  }

  .list-item .info {
    font-size: 0.9rem;
    color: var(--text-secondary-color);
    line-height: 1.5;
  }
  .list-item .info strong {
    color: var(--text-primary-color);
    font-weight: 500;
    font-size: 1rem;
  }

  .severity-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    color: white;
  }

  .severity-high { background-color: var(--danger-color); }
  .severity-medium { background-color: var(--warning-color); }
  .severity-low { background-color: var(--info-color); }
  
  /* 구조물 관리 페이지 */
  #structure-management-view {
    flex-direction: column;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  /* ------------------------- */
  /* --- 6. 모달 (Modal) --- */
  /* ------------------------- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: none; /* 기본 숨김 */
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--surface-color);
    padding: 32px;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    position: relative;
    animation: slide-up 0.3s ease-out;
  }
  
  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary-color);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 24px;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .modal-footer {
    margin-top: 24px;
    text-align: right;
  }
  
  /* ------------------------- */
  /* --- 7. 인증 뷰 (로그인/회원가입) --- */
  /* ------------------------- */
  .auth-view {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--background-color);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    transition: opacity 0.3s;
  }
  
  .auth-box {
    background-color: var(--surface-color);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .auth-box h2 {
    margin-bottom: 24px;
    color: var(--primary-color);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .error-message {
    color: ${({ theme }) => theme.colors.danger}; /* ⭐️ theme 사용으로 업데이트 */
    font-size: 0.9rem;
    height: 1em;
    text-align: left;
  }
`;

export default GlobalStyle;
