# Backend Architecture

## 1. Overview
The WFA backend is a stateless REST and real-time WebSocket API service built with **Node.js**, **Express**, and **TypeScript** in Strict Mode.

## 2. Directory Structure
```text
backend/src/
├── config/          # Zod-validated environment configurations
├── controllers/     # Request handlers & HTTP responses
├── middleware/      # Security, rate limiting, error handling, 404
├── modules/         # Business domain logic (Task 7+)
├── routes/          # API route definitions (/api/v1/*)
├── services/        # Business logic services
├── sockets/         # Socket.IO connection and event handlers
├── types/           # Backend TypeScript types & models
├── app.ts           # Express application initialization & middleware assembly
└── server.ts        # HTTP server bootstrap and graceful shutdown handler
```

## 3. Middleware Pipeline
Requests execute through the following ordered pipeline:
1. `Helmet`: Applies enterprise security HTTP headers.
2. `CORS`: Restricts access to authorized origin (`http://localhost:3000`).
3. `Rate Limiter`: Protects against brute-force and denial-of-service attempts (300 req / 15 min per IP).
4. `Morgan`: Structured request logging.
5. `Express Body Parsers`: Parses JSON and URL-encoded bodies with payload limits.
6. `Cookie Parser`: Extracts HTTP-only session cookies.
7. `Router Pipeline`: Dispatches requests to `/api/v1/*`.
8. `404 Handler`: Catches unmapped routes with standardized JSON error responses.
9. `Central Error Handler`: Catches synchronous and asynchronous errors with stack trace obfuscation in production.

## 4. Graceful Shutdown
The server listens for `SIGINT` and `SIGTERM` signals. Upon receiving a termination request, it stops accepting new connections, waits for ongoing requests to finish, and closes resources cleanly with a 5-second safeguard timeout.
