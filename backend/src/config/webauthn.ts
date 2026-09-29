import { env } from './env';

// Relying Party (RP) Configuration for WebAuthn / FIDO2
export const webAuthnConfig = {
  // Human-readable title shown on Windows Hello / Touch ID prompts
  rpName: env.RP_NAME,

  // The domain that owns the credential (e.g. localhost)
  rpID: env.RP_ID,

  // The exact origin of the client application
  expectedOrigin: env.ORIGIN || env.CORS_ORIGIN,

  // Supported timeout for authenticator interaction (60 seconds)
  timeout: 60000,

  // Supported attestation conveyance
  attestationType: 'none' as const,
};

export default webAuthnConfig;
