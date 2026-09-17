# Workforce Analytics Platform (WFA)

## Project Objective
A secure, API-connected enterprise analytics platform providing workforce visibility, skill analysis, recruitment & learning insights, attrition prediction, demand forecasting, and executive reporting.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Material UI (MUI), Lucide Icons, Redux Toolkit, TanStack Query, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Morgan, Cookie-Parser, Express Rate Limit, Zod.
- **Database**: MongoDB (Stateless foundation in Day 1–2; persistence begins in Task 7).
- **Authentication**: Microsoft Entra ID (Architecture prepared; integration targeted for Task 9).
- **Testing**: Vitest, React Testing Library, Playwright.

## Project Structure
```text
wfa-project/
├── frontend/          # React + Vite + TypeScript application
├── backend/           # Express + TypeScript API server
├── docs/              # Architecture and design documentation
├── tests/             # End-to-end and integration tests
├── .env.example       # Template for environment variables
├── .gitignore         # Ignored files and directories
├── LICENSE            # MIT License
├── README.md          # Project documentation
└── package.json       # Root scripts and workspace orchestration