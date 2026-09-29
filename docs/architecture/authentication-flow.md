# Microsoft Authentication Flow

## 1. Overview
Authentication for WFA is powered exclusively by **Microsoft Entra ID** (formerly Azure Active Directory). 

> **Important Security Boundaries:**
> - No local username/password login forms are supported.
> - The application never accepts or stores user passwords.
> - Microsoft controls passwordless authentication, Windows Hello, Microsoft Authenticator, and MFA.
> - No tokens or secrets are stored in browser `localStorage` or `sessionStorage`.

## 2. Authentication Sequence

```
User (Browser)               Frontend App              Backend API           Microsoft Entra ID
      │                            │                        │                         │
      │ 1. Click "Sign in"         │                        │                         │
      ├───────────────────────────>│                        │                         │
      │                            │ 2. Redirect to /login  │                         │
      │<───────────────────────────┤                        │                         │
      │                            │                        │                         │
      │ 3. Redirect to Microsoft Identity OAuth Endpoint    │                         │
      ├──────────────────────────────────────────────────────────────────────────────>│
      │                                                                               │
      │ 4. Authenticate via Passwordless / MFA / FIDO2 / Authenticator App            │
      │<─────────────────────────────────────────────────────────────────────────────>│
      │                                                                               │
      │ 5. Authorization code returned via redirect URI                               │
      │<──────────────────────────────────────────────────────────────────────────────┤
      │                            │                        │                         │
      │ 6. Send auth code          │                        │                         │
      ├───────────────────────────>│                        │                         │
      │                            │ 7. Forward auth code   │                         │
      │                            ├───────────────────────>│                         │
      │                            │                        │ 8. Exchange code        │
      │                            │                        ├────────────────────────>│
      │                            │                        │ 9. Return ID/Tokens     │
      │                            │                        │<────────────────────────┤
      │                            │                        │                         │
      │                            │                        │ 10. Provision User      │
      │                            │                        │ 11. Create Session      │
      │                            │ 12. Set HTTP-only      │                         │
      │                            │     Session Cookie     │                         │
      │                            │<───────────────────────┤                         │
      │ 13. Navigates to Dashboard │                        │                         │
      │<───────────────────────────┤                        │                         │
```

## 3. Session Security
- **Cookie Flags**: `HttpOnly`, `Secure` (in production), `SameSite=Strict`.
- **Token Invalidation**: Calling logout clears the session cookie and redirects to Microsoft's post-logout endpoint.
