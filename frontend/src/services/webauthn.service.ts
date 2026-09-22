import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { api } from '../api/client';

export interface WebAuthnUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  department?: string;
  lastLogin?: string;
}

export interface CredentialItem {
  _id: string;
  credentialID: string;
  friendlyName: string;
  credentialDeviceType: string;
  transports: string[];
  createdAt: string;
  lastUsedAt: string;
}

/**
 * 1. Check Browser & Platform Authenticator Capability
 */
export const checkWebAuthnCapability = async (): Promise<{
  supported: boolean;
  platformAvailable: boolean;
}> => {
  const supported = browserSupportsWebAuthn();
  const platformAvailable = supported ? await platformAuthenticatorIsAvailable() : false;
  return { supported, platformAvailable };
};

/**
 * 2. Register With Passkey Ceremony
 */
export const registerWithPasskey = async (
  username: string,
  email: string,
  displayName: string
): Promise<{ verified: boolean; user: WebAuthnUser; token?: string }> => {
  // Step 1: Request registration options from backend
  const challengeRes: any = await api.post('/auth/register-challenge', {
    username,
    email,
    displayName,
  });

  const options = challengeRes.options || challengeRes.data?.options;
  if (!options) {
    throw new Error('Failed to retrieve registration challenge from server.');
  }

  // Step 2: Native browser prompt (Windows Hello / Touch ID / YubiKey)
  const attestationResponse = await startRegistration({ optionsJSON: options });

  // Step 3: Send attestation to backend for verification
  const verifyRes: any = await api.post('/auth/register-verify', {
    response: attestationResponse,
    friendlyName: `${displayName}'s Passkey`,
  });

  if (verifyRes.token) {
    localStorage.setItem('wfa_token', verifyRes.token);
  }
  if (verifyRes.user) {
    localStorage.setItem('wfa_user', JSON.stringify(verifyRes.user));
  }

  return {
    verified: verifyRes.verified,
    user: verifyRes.user,
    token: verifyRes.token,
  };
};

/**
 * 3. Login With Passkey Ceremony
 */
export const loginWithPasskey = async (
  username?: string
): Promise<{ verified: boolean; user: WebAuthnUser; token?: string }> => {
  // Step 1: Request authentication challenge options
  const challengeRes: any = await api.post('/auth/login-challenge', {
    username: username ? username.trim().toLowerCase() : undefined,
  });

  const options = challengeRes.options || challengeRes.data?.options;
  if (!options) {
    throw new Error('Failed to retrieve authentication challenge from server.');
  }

  // Step 2: Native device prompt to sign challenge with private key
  const assertionResponse = await startAuthentication({ optionsJSON: options });

  // Step 3: Verify signature assertion on backend
  const verifyRes: any = await api.post('/auth/login-verify', {
    response: assertionResponse,
  });

  if (verifyRes.token) {
    localStorage.setItem('wfa_token', verifyRes.token);
  }
  if (verifyRes.user) {
    localStorage.setItem('wfa_user', JSON.stringify(verifyRes.user));
  }

  return {
    verified: verifyRes.verified,
    user: verifyRes.user,
    token: verifyRes.token,
  };
};

/**
 * 4. Fetch Active User Session Profile
 */
export const fetchCurrentUserSession = async (): Promise<{
  isAuthenticated: boolean;
  user: WebAuthnUser | null;
}> => {
  try {
    const res: any = await api.get('/auth/me');
    return {
      isAuthenticated: res.isAuthenticated || false,
      user: res.user || null,
    };
  } catch (err) {
    return { isAuthenticated: false, user: null };
  }
};

/**
 * 5. Sign Out User Session
 */
export const logoutUserSession = async (): Promise<boolean> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('wfa_token');
    localStorage.removeItem('wfa_user');
    return true;
  } catch (err) {
    localStorage.removeItem('wfa_token');
    localStorage.removeItem('wfa_user');
    return false;
  }
};

/**
 * 6. Credential Management
 */
export const fetchUserCredentials = async (): Promise<CredentialItem[]> => {
  const res: any = await api.get('/auth/credentials');
  return res.credentials || res.data || [];
};

export const renameUserCredential = async (
  id: string,
  friendlyName: string
): Promise<boolean> => {
  const res: any = await api.patch(`/auth/credentials/${id}`, { friendlyName });
  return res.success;
};

export const revokeUserCredential = async (id: string): Promise<boolean> => {
  const res: any = await api.delete(`/auth/credentials/${id}`);
  return res.success;
};
