import { env } from './env';

// Relying Party (RP) Configuration for WebAuthn / FIDO2
export const webAuthnConfig = {
  // Human-readable title shown on Windows Hello / Touch ID prompts
  rpName: 'Workforce Analytics Platform',

  // The domain that owns the credential
  // In development: 'localhost'
  rpID: process.env.RP_ID || 'localhost',

  // The exact origin of the client application
  expectedOrigin: env.CORS_ORIGIN || 'http://localhost:3000',

  // Supported timeout for authenticator interaction (60 seconds)
  timeout: 60000,

  // Supported attestation conveyance
  attestationType: 'none' as const,
};

export default webAuthnConfig;
