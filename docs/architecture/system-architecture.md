# System Architecture

## 1. High-Level Architecture Overview

The **Workforce Analytics Platform (WFA)** is designed as a secure, enterprise-grade, API-connected analytics system providing workforce visibility, skill analysis, recruitment & learning insights, attrition prediction, demand forecasting, and executive reporting.

```
┌────────────────────────────────────────────────────────┐
│             Client Layer (React 18 + Vite)             │
│  - Material UI + Custom Design System                  │
│  - Redux Toolkit (UI State) + TanStack Query (Server)  │
│  - Lucide Icons & Recharts Visualization               │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌────────────────────────────────────────────────────────┐
│         API Gateway & Server Layer (Express + TS)       │
│  - Security: Helmet, CORS, Rate Limiting, Cookies      │
│  - Zod Environment & Request Validation                │
│  - Central Error Handling & Structured Logging         │
│  - Modular Route Handlers (`/api/v1/*`)                │
│  - Real-time Socket.IO Server                          │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   Microsoft Entra ID    │    │      Database Layer     │
│   (Identity Provider)   │    │  MongoDB (Task 7+)      │
│  - OIDC / OAuth 2.0     │    │  - Mongoose ODM         │
│  - MFA & Passwordless   │    │  - Multi-tenant schemas │
│  - Secure HTTP-only     │    │  - Audit logs & indexes │
└─────────────────────────┘    └─────────────────────────┘
```

## 2. Core Architectural Principles
1. **Stateless Backend**: Stateless REST APIs using secure session identifiers / HTTP-only cookies.
2. **Strict Type Safety**: TypeScript strict mode enabled across both frontend and backend.
3. **Defense-in-Depth Security**: UI role guards manage user experience; the backend is the authoritative security boundary.
4. **No Token Storage in LocalStorage**: Microsoft access tokens and sensitive credentials are never stored in browser storage.
5. **Separation of Concerns**: Clean isolation between presentation, state management, API clients, and business logic.
