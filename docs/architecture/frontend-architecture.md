# Frontend Architecture

## 1. Overview
The WFA frontend is built with **React 18**, **TypeScript** (Strict Mode), and **Vite**, utilizing **Material UI (MUI)** with a centralized design token system.

## 2. Directory Structure
```text
frontend/src/
├── api/             # Centralized Axios client, interceptors, API helpers
├── components/      # Reusable UI component library
│   ├── common/      # Generic buttons, inputs, cards, dialogs
│   ├── feedback/    # ErrorBoundary, loading states, empty states, 403/404
│   ├── layout/      # Enterprise layout, sidebar, header, breadcrumbs
│   └── navigation/  # Navigation links, role-based item filters
├── features/        # Modular business feature directories (Task 5+)
│   ├── admin/
│   ├── analytics/
│   ├── attendance/
│   ├── compliance/
│   ├── employees/
│   ├── hr/
│   ├── manager/
│   ├── payroll/
│   ├── scheduling/
│   └── team-lead/
├── store/           # Redux Toolkit store (UI & client state)
├── theme/           # Design tokens, MUI light/dark theme, ThemeContext
├── types/           # Shared TypeScript interfaces & types
├── App.tsx          # Root presentation component
└── main.tsx         # Root mounting point with context providers
```

## 3. State Management Strategy
- **Server Cache & Data Fetching**: TanStack React Query (`@tanstack/react-query`) handles all asynchronous server state, caching, background refetching, and query invalidation.
- **Client & UI State**: Redux Toolkit handles global UI states such as sidebar collapse, active modal triggers, and temporary preferences.
- **Visual Preference State**: Visual theme preference (Light, Dark, System) is managed via `ThemeContext` and persisted in `localStorage`. Sensitive tokens or business data are strictly prohibited from `localStorage`.

## 4. API Client & Networking
- Centralized Axios client (`src/api/client.ts`).
- Automatic timeout protection (10 seconds).
- `withCredentials: true` enabled for cross-origin secure cookie transmission.
- Interceptors capture network disconnects and 401 unauthenticated signals to trigger clean session redirects.
