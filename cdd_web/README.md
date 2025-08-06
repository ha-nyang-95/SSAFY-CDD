## `README.md`

이 문서는 구조물 안전 모니터링 대시보드 웹 애플리케이션 개발을 위한 단일 진실 공급원(Single Source of Truth) 역할을 합니다. 모든 기능과 컴포넌트가 명확하게 정의되어 있으며, 개발 진행 상황을 추적할 수 있는 체크리스트를 포함합니다.

### 🚀 설치 명령어

프로젝트에 필요한 모든 라이브러리를 설치하는 단일 명령어입니다.
```bash
npm install react react-dom next styled-components axios @tanstack/react-query && \
npm install -D \
  @storybook/react-webpack5@^8.6.14 \
  @storybook/addon-essentials@^8.6.14 \
  @storybook/addon-interactions@^8.6.14 \
  @storybook/addon-links@^8.6.14 \
  @storybook/blocks@^8.6.14 \
  eslint prettier husky typescript \
  @types/react @types/node @types/styled-components
```

### 📋 프로젝트 개발 계획

프로젝트는 다음 6가지 주요 단계로 진행됩니다. 각 단계별 상세 체크리스트를 통해 진행 상황을 관리합니다.

---

### **1. 분석 및 기획 (Analysis & Planning)**

이 단계에서는 프로젝트의 디자인 시스템, 재사용 가능한 컴포넌트, 전역 레이아웃 및 핵심 사용자 흐름을 정의합니다.

#### **1.1. 디자인 토큰 (Design Tokens)**

*   **색상 (Colors):** `style_guide.md`를 기준으로 합니다. `mockup.html`에 정의된 색상과 차이가 있으므로, `style_guide.md`의 팔레트를 따릅니다.
    *   `- [ ] Primary Color: #0A3D62 (Deep Blue)`
    *   `- [ ] Secondary Color: #A4B0BE (Slate Gray)`
    *   `- [ ] Accent Color: #0984E3 (Bright Blue)`
    *   `- [ ] Neutral Colors:`
        *   `- [ ] #FFFFFF (White)`
        *   `- [ ] #F1F2F6 (Light Gray)`
        *   `- [ ] #CED6E0 (Gray)`
        *   `- [ ] #747D8C (Dark Gray)`
        *   `- [ ] #2F3640 (Near Black)`
    *   `- [ ] Status Colors:`
        *   `- [ ] Success: #2ECC71 (Green)`
        *   `- [ ] Warning: #F39C12 (Amber)`
        *   `- [ ] Danger/Error: #E74C3C (Red)`
*   **타이포그래피 (Typography):** `style_guide.md`를 기준으로 합니다. `mockup.html`에 정의된 폰트와 차이가 있으므로, `style_guide.md`의 폰트를 따릅니다.
    *   `- [ ] 주 서체 (Primary Font): Inter`
    *   `- [ ] 보조 서체 (Secondary Font): Source Sans Pro`
    *   `- [ ] 기본 폰트 크기: 16px`
    *   `- [ ] 헤더 타이틀 폰트 크기: 1.25rem`
    *   `- [ ] 내비게이션 버튼 텍스트 폰트 크기: 0.75rem`
    *   `- [ ] 콘텐츠 카드 타이틀 폰트 크기: 1.1rem`
    *   `- [ ] 리스트 아이템 정보 폰트 크기: 0.9rem`
    *   `- [ ] 리스트 아이템 강조 텍스트 폰트 크기: 1rem`
    *   `- [ ] 심각도 배지 폰트 크기: 0.8rem`
    *   `- [ ] 모달 타이틀/페이지 헤더 폰트 크기: 1.5rem`
    *   `- [ ] 라이브 피드 컨테이너 폰트 크기: 1.5rem`
*   **간격 (Spacing):**
    *   `- [ ] `spacing-xs`: 6px (nav button gap)`
    *   `- [ ] `spacing-sm`: 8px (modal input group gap, auth button margin-top)`
    *   `- [ ] `spacing-md`: 10px (nav button padding)`
    *   `- [ ] `spacing-lg`: 12px (list item margin-bottom, modal input padding, modal button padding)`
    *   `- [ ] `spacing-xl`: 16px (user profile gap, content card title margin-bottom, auth form gap, list item padding)`
    *   `- [ ] `spacing-2xl`: 20px (action sidebar gap)`
    *   `- [ ] `spacing-3xl`: 24px (header padding, action sidebar padding, main content padding/gap, content card padding, auth box h2 margin-bottom, switch auth button margin-top, modal footer margin-top)`
    *   `- [ ] `spacing-4xl`: 32px (modal content padding)`
    *   `- [ ] `spacing-5xl`: 40px (auth box padding)`
*   **테두리 반경 (Border Radius):**
    *   `- [ ] `rounded-sm`: 8px (header button, nav button, modal input, auth input, auth button)`
    *   `- [ ] `rounded-md`: 12px (content card, severity badge, live feed container)`
    *   `- [ ] `rounded-lg`: 16px (modal content, auth box)`
*   **그림자 (Box Shadow):**
    *   `    *   `- [x] `shadow-md`: `0 10px 30px rgba(0,0,0,0.1)` (modal content, auth box)``

#### **1.2. 재사용 가능한 컴포넌트 (Atomic Design)**

*   **Atoms (원자):**
    *   `- [x] Button: `variant` (primary, secondary, danger, nav, auth, switch-auth), `size` (sm, md, lg), `onClick`, `disabled`, `children`
    *   `- [x] Input: `type` (text, password), `placeholder`, `value`, `onChange`, `readOnly`, `required`
    *   `- [x] Label: `htmlFor`, `children`
    *   `- [x] Icon: `name` (video, 3d-model, structure), `size`, `color`
    *   `- [x] Text 컴포넌트 개발 (props: `variant`, `color`, `fontSize`, `fontWeight`, `children`)
    *   `- [x] Badge: `variant` (high, medium, low), `children`
*   **Molecules (분자):**
    *   `- [x] UserProfileDisplay: `username`, `isLoggedIn`, `onLogout`, `onLoginClick`, `onJoinClick`
    *   `- [x] NavButton: `iconName`, `label`, `isActive`, `onClick`
    *   `- [x] ListItem: `children`, `onClick` (for crack items)`
    *   `- [x] ModalInputGroup: `children`
    *   `- [x] ErrorMessage: `message`
*   **Organisms (유기체):**
    *   `- [x] AppHeader: `title`, `username`, `isLoggedIn`, `onLogout`, `onLoginClick`, `onJoinClick`
    *   `- [x] ActionSidebar: `activeView`, `onNavClick`
    *   `- [x] AuthForm: `type` (login/signup), `onSubmit`, `onSwitchAuth`, `errorMessage`
    *   `- [x] ContentCard: `title`, `children`
    *   `- [x] LiveFeedContainer: `status` (live/offline), `message`
    *   `- [x] CrackAnalysisSummary: `crackData` (array of crack objects), `onCrackItemClick`
    *   `- [x] StructureManagementList: `structures` (array of structure objects), `onCreateStructureClick`
    *   `- [x] DetailModal: `isOpen`, `onClose`, `crackDetailData`
    *   `- [x] CreateStructureModal: `isOpen`, `onClose`, `onSubmit`, `onGenerateLink`

#### **1.3. 글로벌 레이아웃 (Global Layouts)**

*   `    *   `- [x] AppContainer: 전체 애플리케이션을 감싸는 컨테이너``
*   `    *   `- [x] MainWrapper: 헤더와 메인 콘텐츠 영역을 포함하는 래퍼``
*   `    *   `- [x] MainContent: 대시보드의 주요 콘텐츠 영역``
*   `*   `- [x] ContentView: 각 대시보드 뷰의 기본 레이아웃``
*   `- [x] AuthLayout: 로그인/회원가입 페이지의 레이아웃`

#### **1.4. 사용자 흐름 (User Flows)**

*   `- [ ] 로그인/회원가입/로그아웃 흐름 정의 및 구현`
*   `- [ ] 대시보드 뷰 전환 (실시간 모니터링, 3D 모델 시각화, 구조물 관리) 흐름 정의 및 구현`
*   `- [ ] 균열 상세 정보 확인 (모달) 흐름 정의 및 구현`
*   `- [x] 신규 구조물 생성 (모달) 흐름 정의 및 구현`

---

### **2. 환경 설정 (Environment Setup)**

이 단계에서는 프로젝트의 기본 구조를 설정하고 필요한 개발 도구 및 설정을 구성합니다.

#### **2.1. 권장 폴더 구조**

기능 기반(Feature-Based) 구조를 중심으로, 재사용 가능한 UI 컴포넌트는 아토믹 디자인 원칙에 따라 `components` 폴더 내에 관리합니다.

```
src/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   └── common/ (모달 등 여러 기능에서 공통으로 사용되는 컴포넌트)
├── hooks/ (전역 커스텀 훅)
├── layouts/ (AppLayout, AuthLayout 등)
├── pages/ (Next.js 페이지)
├── services/ (API 클라이언트, 유틸리티 함수)
├── styles/
│   ├── global.ts (전역 스타일)
│   ├── theme.ts (디자인 토큰 및 테마)
│   └── mixins.ts (재사용 가능한 CSS 믹스인)
├── types/ (전역 TypeScript 타입 정의)
└── utils/ (일반 유틸리티 함수)
```

*   `- [x] `src/` 디렉토리 생성`
*   `- [x] `assets/` 디렉토리 및 하위 폴더 생성`
*   `- [x] `components/` 디렉토리 및 `atoms`, `molecules`, `organisms` 하위 폴더 생성`
*   `- [x] `features/` 디렉토리 및 `auth`, `dashboard`, `common` 하위 폴더 생성 (각각 `components`, `hooks`, `api`, `types` 포함)`
*   `- [x] `hooks/` 디렉토리 생성`
*   `- [ ] `layouts/` 디렉토리 생성`
*   `- [x] `pages/` 디렉토리 생성`
*   `- [ ] `services/` 디렉토리 생성`
*   `- [ ] `styles/` 디렉토리 및 `global.ts`, `theme.ts`, `mixins.ts` 파일 생성`
*   `- [ ] `types/` 디렉토리 생성`
*   `- [x] `utils/` 디렉토리 생성`

#### **2.2. 설정 파일**

*   `- [ ] `package.json` 초기화 및 의존성 추가`
*   `- [ ] `next.config.js` 설정`
*   `- [ ] `.eslintrc.js` 설정 (ESLint)`
*   `- [ ] `.prettierrc.js` 설정 (Prettier)`
*   `- [ ] `tsconfig.json` 설정 (TypeScript)`
*   `- [ ] `.storybook/main.js`, `.storybook/preview.js` 설정 (Storybook)`
*   `- [x] `.husky/pre-commit` 훅 설정 (Husky)`

---

### **3. 컴포넌트 개발 (Component Development)**

이 단계에서는 정의된 디자인 토큰과 아토믹 디자인 원칙에 따라 모든 UI 컴포넌트를 개발합니다.

#### **3.1. Atoms (원자) 개발**

*   `- [x] Button 컴포넌트 개발 (props: `variant`, `size`, `onClick`, `disabled`, `children`; states: default, hover, active, disabled)`
*   `- [x] Input 컴포넌트 개발 (props: `type`, `placeholder`, `value`, `onChange`, `readOnly`, `required`; states: default, focused, error, readOnly)`
*   `- [x] Label 컴포넌트 개발 (props: `htmlFor`, `children`)`
*   `- [x] Icon 컴포넌트 개발 (props: `name`, `size`, `color`)`
*   `- [x] Text 컴포넌트 개발 (props: `variant`, `color`, `fontSize`, `fontWeight`, `children`)`
*   `- [x] Badge 컴포넌트 개발 (props: `variant`, `children`)`

#### **3.2. Molecules (분자) 개발**

*   `- [x] UserProfileDisplay 컴포넌트 개발 (props: `username`, `isLoggedIn`, `onLogout`, `onLoginClick`, `onJoinClick`)`
*   `- [x] NavButton 컴포넌트 개발 (props: `iconName`, `label`, `isActive`, `onClick`)`
*   `- [x] ListItem 컴포넌트 개발 (props: `children`, `onClick`)`
*   `- [x] ModalInputGroup 컴포넌트 개발 (props: `children`)`
*   `- [x] ErrorMessage 컴포넌트 개발 (props: `message`)`

#### **3.3. Organisms (유기체) 개발**

*   `- [x] AppHeader 컴포넌트 개발 (props: `title`, `username`, `isLoggedIn`, `onLogout`, `onLoginClick`, `onJoinClick`)`
*   `- [x] ActionSidebar 컴포넌트 개발 (props: `activeView`, `onNavClick`)`
*   `- [x] AuthForm 컴포넌트 개발 (props: `type`, `onSubmit`, `onSwitchAuth`, `errorMessage`)`
*   `- [x] ContentCard 컴포넌트 개발 (props: `title`, `children`)`
*   `- [x] LiveFeedContainer 컴포넌트 개발 (props: `status`, `message`)`
*   `- [x] CrackAnalysisSummary 컴포넌트 개발 (props: `crackData`, `onCrackItemClick`)`
*   `- [x] StructureManagementList 컴포넌트 개발 (props: `structures`, `onCreateStructureClick`)`
*   `- [x] DetailModal 컴포넌트 개발 (props: `isOpen`, `onClose`, `crackDetailData`)`
*   `- [x] CreateStructureModal 컴포넌트 개발 (props: `isOpen`, `onClose`, `onSubmit`, `onGenerateLink`)`

---

### **4. 페이지 조립 및 라우팅 (Page Assembly & Routing)**

이 단계에서는 개발된 컴포넌트들을 조합하여 실제 페이지를 구성하고, Next.js 라우팅을 설정합니다.

#### **4.1. 페이지 목록 및 구성**

*   `- [x] **로그인 페이지**`
    *   `- [ ] URL: `/login``
    *   `- [ ] 구성 컴포넌트: `AuthLayout`, `AuthForm` (type: 'login'), `ErrorMessage``
*   `- [x] **회원가입 페이지**`
    *   `- [ ] URL: `/signup``
    *   `- [ ] 구성 컴포넌트: `AuthLayout`, `AuthForm` (type: 'signup')`
*   `- [x] **대시보드 메인 페이지**`
    *   `- [ ] URL: `/``
    *   `- [ ] 구성 컴포넌트: `AppContainer`, `ActionSidebar`, `AppHeader`, `MainContent``
*   `- [ ] **실시간 모니터링 뷰** (대시보드 내)`
    *   `- [ ] URL: `/dashboard/real-time` (또는 대시보드 페이지 내 상태 관리)`
    *   `- [ ] 구성 컴포넌트: `LiveFeedContainer``
*   `- [ ] **3D 모델 시각화 뷰** (대시보드 내)`
    *   `- [ ] URL: `/dashboard/3d-model` (또는 대시보드 페이지 내 상태 관리)`
    *   `- [ ] 구성 컴포넌트: `ContentCard` (3D 뷰어용), `CrackAnalysisSummary``
*   `- [ ] **구조물 관리 뷰** (대시보드 내)`
    *   `- [ ] URL: `/dashboard/structure-management` (또는 대시보드 페이지 내 상태 관리)`
    *   `- [ ] 구성 컴포넌트: `StructureManagementList`, `Button` (생성 버튼)`
*   `- [ ] **균열 상세 모달** (오버레이)`
    *   `- [ ] URL: 직접적인 URL 없음, 상호작용으로 트리거`
    *   `- [ ] 구성 컴포넌트: `DetailModal``
*   `- [x] **신규 구조물 생성 모달** (오버레이)`
    *   `- [ ] URL: 직접적인 URL 없음, 상호작용으로 트리거`
    *   `- [ ] 구성 컴포넌트: `CreateStructureModal``

---

### **5. 상태 관리 및 API 연동 (State Management & API Integration)**

이 단계에서는 애플리케이션의 상태 관리 전략을 수립하고, 백엔드 API와의 연동을 정의합니다.

#### **5.1. 상태 관리 전략**

*   `- [x] **서버 상태 (Server State):** `React Query`를 사용하여 API 데이터(균열, 구조물 목록 등) 관리`
*   `- [x] **전역 클라이언트 상태 (Global Client State):** 사용자 인증 정보 (`isLoggedIn`, `currentUser`), 현재 활성화된 대시보드 뷰 (`activeView`) 등은 `React Context API` 또는 `Zustand`/`Jotai`를 사용하여 관리`
*   `- [ ] **로컬 컴포넌트 상태 (Local Component State):** 폼 입력 값, 모달 열림/닫힘 등은 `useState` 훅으로 관리`

#### **5.2. API 엔드포인트 정의**

*   **인증 (Authentication):**
    *   `- [ ] `POST /api/login`: 사용자 로그인 (body: `{ username, password }`, response: `{ success: boolean, user?: string, message?: string }`)`
    *   `- [ ] `POST /api/signup`: 사용자 회원가입 (body: `{ username, password, employeeId }`, response: `{ success: boolean, message?: string }`)`
    *   `- [x] `POST /api/logout`: 사용자 로그아웃`
*   **균열 데이터 (Crack Data):**
    *   `- [ ] `GET /api/cracks`: 모든 균열 데이터 조회 (response: `Crack[]`)`
    *   `- [ ] `GET /api/cracks/:id`: 특정 균열 상세 정보 조회 (params: `{ id }`, response: `CrackDetail`)`
*   **구조물 관리 (Structure Management):**
    *   `- [ ] `GET /api/structures`: 모든 구조물 목록 조회 (response: `Structure[]`)`
    *   `- [ ] `POST /api/structures`: 신규 구조물 생성 (body: `{ name, location, link }`, response: `NewStructure`)`
    *   `- [ ] `GET /api/structures/generate-link`: 3D 모델 링크 생성 (response: `{ link: string }`)`
*   **실시간 모니터링 (Real-time Monitoring):**
    *   `- [x] `GET /api/live-feed-status`: 실시간 드론 영상 스트리밍 상태 조회 (response: `{ status: 'live' | 'offline', url?: string }`)`

---

### **6. 테스트 및 개선 (Testing & Refinement)**

이 단계에서는 애플리케이션의 품질을 보장하기 위한 테스트를 작성하고, 성능, 접근성, 코드 품질을 개선합니다.

#### **6.1. 테스트 전략**

*   **단위 테스트 (Unit Tests):**
    *   `- [x] Atoms 컴포넌트 (Button, Input 등)의 렌더링 및 상호작용 테스트`
    *   *   `- [x] 유틸리티 함수 및 커스텀 훅 로직 테스트`
*   **통합 테스트 (Integration Tests):**
    *   `- [x] AuthForm과 인증 로직 연동 테스트`
    *   `- [x] AppHeader 및 ActionSidebar의 뷰 전환 기능 테스트`
    *   `- [x] 모달 컴포넌트의 열림/닫힘 및 데이터 표시 테스트`
*   **E2E 테스트 (End-to-End Tests):**
    *   `- [ ] 사용자 로그인부터 대시보드 탐색, 균열 상세 확인, 구조물 생성까지의 전체 사용자 흐름 테스트`
    *   `- [ ] 모든 페이지의 라우팅 및 뷰 전환 테스트`
    *   `- [ ] API 연동 후 데이터가 올바르게 화면에 표시되는지 테스트`

#### **6.2. 성능 최적화 (Core Web Vitals)**

*   `- [ ] 이미지 최적화 (WebP/AVIF 포맷 사용, `srcset`, `loading="lazy"` 적용)`
*   `- [ ] 코드 분할 (Next.js 자동 코드 분할 활용, 필요시 `React.lazy` 추가)`
*   `- [ ] 불필요한 리소스 제거 (Tree Shaking, Minification)`
*   `- [x] 데이터 페칭 최적화 (React Query의 캐싱 및 stale-while-revalidate 전략 활용)`

#### **6.3. 웹 접근성 (WCAG)**

*   `- [ ] 모든 인터랙티브 요소에 시맨틱 HTML 태그 사용`
*   `- [ ] 스크린 리더 사용자를 위한 ARIA 속성 적용`
*   `- [ ] 키보드 내비게이션 가능하도록 `tabIndex` 및 포커스 관리`
*   `- [x] 의미 있는 이미지에 `alt` 속성 제공`

#### **6.4. 코드 품질 및 유지보수성**

*   `- [ ] ESLint 및 Prettier 설정으로 코드 스타일 일관성 유지`
*   `- [ ] TypeScript를 활용하여 타입 안정성 확보`
*   `- [ ] SOLID 원칙 준수하여 컴포넌트 및 모듈 설계`
*   `- [x] 크로스 브라우저 호환성 테스트 및 Babel/PostCSS 설정`

### `src` 디렉토리 구조

```
src/
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── vite-env.d.ts
├── assets/
│   ├── react.svg
│   ├── fonts/
│   ├── icons/
│   └── images/
├── components/
│   ├── atoms/
│   │   ├── Badge.stories.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.tsx
│   │   ├── Icon.stories.tsx
│   │   ├── Icon.tsx
│   │   ├── Input.stories.tsx
│   │   ├── Input.tsx
│   │   ├── Label.stories.tsx
│   │   ├── Label.tsx
│   │   ├── Text.stories.tsx
│   │   └── Text.tsx
│   ├── molecules/
│   │   ├── ErrorMessage.stories.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── ListItem.stories.tsx
│   │   ├── ListItem.tsx
│   │   ├── ModalInputGroup.stories.tsx
│   │   ├── ModalInputGroup.tsx
│   │   ├── NavButton.stories.tsx
│   │   ├── NavButton.tsx
│   │   ├── UserProfileDisplay.stories.tsx
│   │   └── UserProfileDisplay.tsx
│   └── organisms/
│       ├── ActionSidebar.stories.tsx
│       ├── ActionSidebar.tsx
│       ├── AppHeader.stories.tsx
│       ├── AppHeader.tsx
│       ├── AuthForm.stories.tsx
│       ├── AuthForm.tsx
│       ├── ContentCard.stories.tsx
│       ├── ContentCard.tsx
│       ├── CrackAnalysisSummary.stories.tsx
│       ├── CrackAnalysisSummary.tsx
│       ├── CreateStructureModal.stories.tsx
│       ├── CreateStructureModal.tsx
│       ├── DetailModal.stories.tsx
│       ├── DetailModal.tsx
│       ├── LiveFeedContainer.stories.tsx
│       ├── LiveFeedContainer.tsx
│       ├── StructureManagementList.stories.tsx
│       └── StructureManagementList.tsx
├── contexts/
│   ├── AuthContext.test.tsx
│   └── AuthContext.tsx
├── features/
│   ├── auth/
│   │   ├── AuthIntegration.test.tsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── common/
│   └── dashboard/
│       ├── DashboardNavigation.test.tsx
│       ├── ModalIntegration.test.tsx
│       ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
├── hooks/
├── layouts/
│   ├── AppContainer.tsx
│   ├── AuthLayout.tsx
│   ├── ContentView.tsx
│   ├── MainContent.tsx
│   └── MainWrapper.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   └── SignUpPage.tsx
├── services/
│   └── api.ts
├── styles/
│   ├── global.ts
│   ├── mixins.ts
│   └── theme.ts
├── types/
└── utils/
```