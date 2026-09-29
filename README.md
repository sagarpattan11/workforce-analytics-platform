# Workforce Analytics Platform (WFA)

## Project Objective
A secure, API-connected enterprise workforce analytics platform providing organizational visibility, employee directory management, headcount distribution, attendance & absence tracking, predictive analytics, and executive reporting.

---

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Material UI (MUI), Lucide Icons, Redux Toolkit, TanStack Query, Recharts, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, Morgan, Cookie-Parser, Express Rate Limit, Zod, Socket.IO.
- **Database**: MongoDB Atlas (Mongoose ODM).
- **Authentication**: Passwordless WebAuthn / Passkeys and FIDO2 Hardware Security Keys (`@simplewebauthn/server` & `@simplewebauthn/browser`).
- **Testing**: Vitest, React Testing Library, Playwright.

---

## Authentication Architecture: WebAuthn & FIDO2 Security Keys

The platform uses 100% passwordless, cryptographic authentication conforming to the W3C WebAuthn Level 3 and FIDO2 standards. Legacy Microsoft Sign-In and passwords are not used.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WEBAUTHN AUTHENTICATION                         │
│                                                                        │
│ 1. Client requests challenge ──► POST /api/v1/auth/login-challenge     │
│ 2. Backend generates cryptographically random challenge (TTL: 2 min)  │
│ 3. Client invokes navigator.credentials.get() via @simplewebauthn/browser│
│    ──► Native OS prompt (Windows Hello / Touch ID / YubiKey)           │
│ 4. Authenticator signs challenge using stored private key             │
│ 5. Client submits signed assertion ──► POST /api/v1/auth/login-verify  │
│ 6. Backend validates signature with stored Public Key in MongoDB      │
│ 7. HttpOnly session cookie + Bearer JWT token issued                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Zero Biometric Storage Guarantee
- **What is stored in MongoDB**: `credentialID`, `credentialPublicKey` (COSE public key buffer), signature `counter`, `transports` (e.g. `usb`, `nfc`, `internal`), `deviceType`, `friendlyName`, and `aaguid`.
- **What is NEVER stored or transmitted**: Fingerprints, facial scan geometry, iris scans, device PINs, or private keys. All biometric matching occurs exclusively within the secure enclave or hardware security key on the user's local device.

### Credential Lifecycle Management
Logged-in users can manage their authenticators under **Settings > FIDO2 Security Keys & Passkeys**:
- **Register**: Add additional platform passkeys or secondary hardware security keys (e.g., a backup YubiKey).
- **Rename**: Assign friendly names to credentials (e.g., "Work Laptop Windows Hello", "YubiKey 5C NFC").
- **Revoke**: Delete lost or retired security keys with instant server-side revocation.
- **Audit Logging**: Every challenge, verification, rename, and revocation event is immutably logged in the `auditlogs` MongoDB collection.

---

## Compatibility Matrix: Browsers, Operating Systems & Security Keys

| Operating System | Supported Browsers | Supported Authenticators | Connection Types |
| :--- | :--- | :--- | :--- |
| **Windows 10 / 11** | Edge 79+, Chrome 67+, Firefox 60+ | Windows Hello (Fingerprint, Facial Recognition, PIN via TPM 2.0), FIDO2 Hardware Keys | Built-in TPM, USB-A, USB-C, NFC |
| **macOS (Big Sur 11+)** | Safari 14+, Chrome 67+, Firefox 60+ | Touch ID, Apple Passkeys (iCloud Keychain sync), FIDO2 Hardware Keys | Built-in Touch ID, USB-A, USB-C, NFC |
| **iOS / iPadOS (14.5+)** | Safari, Chrome, Edge | Face ID, Touch ID, Apple Passkeys, FIDO2 Security Keys | Built-in Biometrics, NFC, Lightning, USB-C |
| **Android (9.0+)** | Chrome 70+, Edge, Firefox 68+ | Android Biometric Prompt (Fingerprint, Face Unlock), Google Password Manager, FIDO2 Keys | Built-in Sensor, USB-C, NFC, Bluetooth |
| **Linux (Ubuntu/Fedora)** | Chrome 67+, Firefox 60+ | FIDO2 Hardware Security Keys (requires `udev` rules / `libfido2`) | USB-A, USB-C |

### Hardware Security Key Support
- **Yubico**: YubiKey 5 NFC, YubiKey 5C NFC, YubiKey 5Ci, Security Key by Yubico.
- **Google**: Titan Security Key (USB-A, USB-C, NFC).
- **Feitian / SoloKeys**: ePass FIDO2, Solo 2.

### Cross-Device Authentication (Hybrid / QR Code)
Users accessing the platform from a desktop or laptop without built-in biometrics can select **"Use a phone or tablet"** during the browser prompt. Scanning the generated QR code establishes an encrypted Bluetooth/FIDO alliance tunnel to verify the user via their smartphone's biometrics.

### Known Limitations
1. **Private / Incognito Mode**: Some browser versions (e.g., Firefox Private Browsing or certain Chromium privacy extensions) disable access to the WebAuthn API (`navigator.credentials`) to prevent browser fingerprinting. Users must access the platform in normal browsing mode.
2. **Virtual Machines & RDP**: Remote desktop sessions and virtual machines require explicit USB passthrough configuration to detect physical FIDO2 keys, and cannot access the host machine's TPM 2.0 / Windows Hello biometric sensor.
3. **HTTPS Requirement**: The WebAuthn API is restricted to **Secure Contexts**. It operates on `http://localhost` during development, but **must be served over HTTPS/TLS** in staging and production environments.

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- MongoDB Atlas cluster or local MongoDB instance
- Modern web browser with WebAuthn support

### Environment Configuration
Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wfa-database
SESSION_SECRET=your_secure_session_secret
JWT_SECRET=your_jwt_signing_secret
JWT_EXPIRES_IN=24h
RP_NAME=Workforce Analytics Platform
RP_ID=localhost
ORIGIN=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Installation & Execution
```bash
# Install dependencies across all packages
npm install
npm --prefix backend install
npm --prefix frontend install

# Run both backend and frontend concurrently
npm run dev

# Run full-stack typechecks
npm run typecheck

# Run test suites (Vitest)
npm test

# Run Playwright E2E tests
npm run test:e2e

# Build for production
npm run build
```