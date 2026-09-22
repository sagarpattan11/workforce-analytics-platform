import { Request, Response } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UAParser } from 'ua-parser-js';
import { webAuthnConfig } from '../config/webauthn';
import { env } from '../config/env';
import { User, IUser } from '../models/user.model';
import { Passkey } from '../models/passkey.model';
import { logAuditEvent } from '../models/audit-log.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// Helper: Parse friendly device name from User-Agent
const parseDeviceFriendlyName = (userAgentHeader?: string, providedName?: string): string => {
  if (providedName && providedName.trim()) {
    return providedName.trim();
  }
  if (!userAgentHeader) return 'Security Key / Device';
  const parser = new UAParser(userAgentHeader);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const parts: string[] = [];
  if (os.name) parts.push(os.name);
  if (browser.name) parts.push(browser.name);
  if (device.model) parts.push(device.model);

  return parts.length > 0 ? `${parts.join(' ')} Passkey` : 'Security Key / Device';
};

// Helper: Generate JWT Token (Dual session support)
const generateToken = (id: string, roles: string[], email: string): string => {
  return jwt.sign({ id, roles, role: roles[0], email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// Zod Schemas
const registerChallengeSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

/**
 * 1. POST /api/v1/auth/register-challenge
 * Generates WebAuthn registration options for a user
 */
export const registerChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    let username: string | undefined;
    let email: string | undefined;
    let displayName: string | undefined;
    let user: IUser | null = null;

    // Check if user is already authenticated via JWT or session
    const authUser = (req as any).user;
    if (authUser) {
      user = await User.findById(authUser._id);
    } else if (req.session?.userId) {
      user = await User.findById(req.session.userId);
    }

    if (user) {
      username = user.username;
      email = user.email;
      displayName = user.displayName;
    } else {
      const parsed = registerChallengeSchema.parse(req.body);
      username = parsed.username;
      email = parsed.email;
      displayName = parsed.displayName;
      const normalizedUsername = username.toLowerCase().trim();
      const normalizedEmail = email.toLowerCase().trim();

      // Find or initialize user
      user = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
      });

      if (!user) {
        user = new User({
          username: normalizedUsername,
          email: normalizedEmail,
          displayName: displayName.trim(),
          name: displayName.trim(),
          roles: ['employee'],
        });
      }
    }

    const normalizedUsername = username!.toLowerCase().trim();

    // Query existing passkeys to exclude them
    const existingPasskeys = user._id ? await Passkey.find({ userId: user._id }) : [];

    const options = await generateRegistrationOptions({
      rpName: webAuthnConfig.rpName,
      rpID: webAuthnConfig.rpID,
      userID: Buffer.from(user._id ? user._id.toString() : normalizedUsername),
      userName: normalizedUsername,
      userDisplayName: displayName || normalizedUsername,
      attestationType: webAuthnConfig.attestationType,
      excludeCredentials: existingPasskeys.map((pk) => ({
        id: pk.credentialID,
        transports: pk.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Save challenge in user document & session
    user.currentChallenge = options.challenge;
    await user.save();

    if (req.session) {
      req.session.currentChallenge = options.challenge;
      req.session.userId = user._id.toString();
      req.session.username = user.username;
    }

    await logAuditEvent({
      action: 'register_challenge',
      userId: user._id,
      username: user.username,
      email: user.email,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Generated registration challenge for ${user.username}`,
    });

    res.status(200).json({ success: true, options });
  } catch (error: any) {
    console.error('Error in registerChallenge:', error);

    await logAuditEvent({
      action: 'register_failure',
      success: false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      failureReason: error.message || 'Validation error in register challenge',
    });

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate registration challenge',
    });
  }
};

/**
 * 2. POST /api/v1/auth/register-verify
 * Cryptographically verifies registration attestation and stores public key
 */
export const registerVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { response, friendlyName, nickname, registrationResponse } = req.body;
    const rawResponse = response || registrationResponse;
    const providedName = friendlyName || nickname;

    if (!rawResponse) {
      res.status(400).json({ success: false, message: 'Attestation response is required' });
      return;
    }

    // Retrieve expected challenge from session or user
    let expectedChallenge = req.session?.currentChallenge;
    let user: IUser | null = null;

    if ((req as any).user) {
      user = await User.findById((req as any).user._id);
      if (user && !expectedChallenge) {
        expectedChallenge = user.currentChallenge;
      }
    } else if (req.session?.userId) {
      user = await User.findById(req.session.userId);
      if (user && !expectedChallenge) {
        expectedChallenge = user.currentChallenge;
      }
    }

    if (!expectedChallenge) {
      res.status(400).json({
        success: false,
        message: 'Registration challenge expired or missing. Please restart registration.',
      });
      return;
    }

    const verification = await verifyRegistrationResponse({
      response: rawResponse,
      expectedChallenge,
      expectedOrigin: webAuthnConfig.expectedOrigin,
      expectedRPID: webAuthnConfig.rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ success: false, message: 'Passkey verification failed' });
      return;
    }

    const { credential, credentialDeviceType, credentialBackedUp, aaguid } =
      verification.registrationInfo;

    if (!user && req.session?.userId) {
      user = await User.findById(req.session.userId);
    }

    if (!user) {
      res.status(400).json({ success: false, message: 'User record not found' });
      return;
    }

    // Parse friendly device name
    const computedFriendlyName = parseDeviceFriendlyName(
      req.headers['user-agent'],
      friendlyName
    );

    // Save Passkey in MongoDB
    const passkey = await Passkey.create({
      userId: user._id,
      credentialID: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      credentialDeviceType,
      credentialBackedUp,
      transports: response.response?.transports || ['internal'],
      friendlyName: computedFriendlyName,
      nickname: computedFriendlyName,
      aaguid,
    });

    // Clear current challenge
    user.currentChallenge = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Establish session
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.roles = user.roles;
      req.session.currentChallenge = undefined;
    }

    // Generate JWT token for client state
    const token = generateToken(user._id.toString(), user.roles, user.email);

    await logAuditEvent({
      action: 'register_success',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.roles[0],
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Successfully registered passkey "${passkey.friendlyName}"`,
    });

    res.status(201).json({
      verified: true,
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    console.error('Error in registerVerify:', error);

    await logAuditEvent({
      action: 'register_failure',
      success: false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      failureReason: error.message || 'Passkey registration verification failed',
    });

    res.status(500).json({ success: false, message: 'Registration verification failed' });
  }
};

/**
 * 3. POST /api/v1/auth/login-challenge
 * Generates authentication options for passkey sign-in
 */
export const loginChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] | undefined;
    let user: IUser | null = null;

    if (username) {
      const normalized = username.toLowerCase().trim();
      user = await User.findOne({
        $or: [{ username: normalized }, { email: normalized }],
      });

      if (user) {
        const userPasskeys = await Passkey.find({ userId: user._id });
        if (userPasskeys.length > 0) {
          allowCredentials = userPasskeys.map((pk) => ({
            id: pk.credentialID,
            transports: pk.transports as AuthenticatorTransport[],
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: webAuthnConfig.rpID,
      timeout: webAuthnConfig.timeout,
      userVerification: 'preferred',
      allowCredentials,
    });

    // Save challenge in session and user if found
    if (req.session) {
      req.session.currentChallenge = options.challenge;
    }
    if (user) {
      user.currentChallenge = options.challenge;
      await user.save();
    }

    await logAuditEvent({
      action: 'login_challenge',
      username: user?.username || username,
      userId: user?._id,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Generated authentication challenge',
    });

    res.status(200).json({ success: true, options });
  } catch (error: any) {
    console.error('Error in loginChallenge:', error);

    await logAuditEvent({
      action: 'login_failure',
      success: false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      failureReason: error.message || 'Failed to generate login challenge',
    });

    res.status(500).json({ success: false, message: 'Failed to generate login options' });
  }
};

/**
 * 4. POST /api/v1/auth/login-verify
 * Verifies assertion signature, updates counter, and establishes session
 */
export const loginVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { response } = req.body;

    if (!response || !response.id) {
      res.status(400).json({ success: false, message: 'Invalid authentication response' });
      return;
    }

    // 1. Find the passkey by credentialID
    const passkey = await Passkey.findOne({ credentialID: response.id });
    if (!passkey) {
      res.status(404).json({
        success: false,
        message: 'No registered passkey found for this device. Please register first.',
      });
      return;
    }

    // 2. Find associated user
    const user = await User.findById(passkey.userId);
    if (!user || !user.isActive) {
      res.status(403).json({ success: false, message: 'User account not found or deactivated' });
      return;
    }

    // 3. Retrieve expected challenge
    const expectedChallenge = req.session?.currentChallenge || user.currentChallenge;
    if (!expectedChallenge) {
      res.status(400).json({
        success: false,
        message: 'Authentication challenge expired. Please try again.',
      });
      return;
    }

    // 4. Verify signature
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: webAuthnConfig.expectedOrigin,
      expectedRPID: webAuthnConfig.rpID,
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransport[],
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      res.status(401).json({ success: false, message: 'Passkey signature verification failed' });
      return;
    }

    // 5. Update counter and lastUsedAt
    passkey.counter = verification.authenticationInfo.newCounter;
    passkey.lastUsedAt = new Date();
    await passkey.save();

    // 6. Update user login time and clear challenge
    user.lastLogin = new Date();
    user.currentChallenge = undefined;
    await user.save();

    // 7. Establish express-session
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.roles = user.roles;
      req.session.currentChallenge = undefined;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.roles, user.email);

    await logAuditEvent({
      action: 'login_success',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.roles[0],
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Signed in via Passkey: "${passkey.friendlyName}"`,
    });

    res.status(200).json({
      verified: true,
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        department: user.department,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    console.error('Error in loginVerify:', error);

    await logAuditEvent({
      action: 'login_failure',
      success: false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      failureReason: error.message || 'Passkey authentication failed',
    });

    res.status(500).json({ success: false, message: 'Passkey authentication failed' });
  }
};

/**
 * 5. GET /api/v1/auth/me
 * Retrieves profile of currently authenticated user session
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(200).json({ isAuthenticated: false, user: null });
    return;
  }

  res.status(200).json({
    isAuthenticated: true,
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      roles: req.user.roles,
      department: req.user.department,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};

/**
 * 6. POST /api/v1/auth/logout
 * Destroys session and clears cookie
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?._id || req.session?.userId;
  const username = req.user?.username || req.session?.username;

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error('Error destroying session:', err);
    });
  }

  res.clearCookie('wfa_session');
  res.clearCookie('token');

  await logAuditEvent({
    action: 'logout',
    userId,
    username,
    success: true,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: 'User logged out',
  });

  res.status(200).json({ loggedOut: true, success: true, message: 'Logged out successfully' });
};

/**
 * 7. Credential Management Endpoints
 */

// GET /api/v1/auth/credentials
export const listCredentials = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const passkeys = await Passkey.find({ userId: req.user?._id })
      .select('credentialID friendlyName nickname credentialDeviceType transports createdAt lastUsedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, credentials: passkeys, data: passkeys });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve credentials' });
  }
};

// PATCH /api/v1/auth/credentials/:id
export const renameCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { friendlyName, nickname } = req.body;
    const newName = (friendlyName || nickname || '').trim();

    if (!newName) {
      res.status(400).json({ success: false, message: 'Valid name is required' });
      return;
    }

    const passkey = await Passkey.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { friendlyName: newName, nickname: newName },
      { new: true }
    );

    if (!passkey) {
      res.status(404).json({ success: false, message: 'Credential not found or unauthorized' });
      return;
    }

    await logAuditEvent({
      action: 'credential_rename',
      userId: req.user?._id,
      username: req.user?.username,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Renamed credential to "${newName}"`,
    });

    res.status(200).json({ success: true, credential: passkey, message: 'Credential renamed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to rename credential' });
  }
};

// DELETE /api/v1/auth/credentials/:id
export const revokeCredential = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const passkey = await Passkey.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });

    if (!passkey) {
      res.status(404).json({ success: false, message: 'Credential not found or unauthorized' });
      return;
    }

    await logAuditEvent({
      action: 'credential_revoke',
      userId: req.user?._id,
      username: req.user?.username,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Revoked credential "${passkey.friendlyName}"`,
    });

    res.status(200).json({ success: true, message: 'Credential revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to revoke credential' });
  }
};

/**
 * 8. Admin Role Management Endpoints (requireRole('admin'))
 */

// GET /api/v1/auth/users
export const listUsers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch passkey counts for each user
    const usersWithPasskeyCount = await Promise.all(
      users.map(async (u) => {
        const passkeyCount = await Passkey.countDocuments({ userId: u._id });
        return {
          id: u._id,
          username: u.username,
          email: u.email,
          displayName: u.displayName,
          roles: u.roles,
          department: u.department,
          passkeyCount,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
        };
      })
    );

    res.status(200).json({ success: true, users: usersWithPasskeyCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
};

// PATCH /api/v1/auth/users/:id/role
export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { roles, role } = req.body;
    const updatedRoles = roles || (role ? [role] : undefined);

    if (!updatedRoles || !Array.isArray(updatedRoles) || updatedRoles.length === 0) {
      res.status(400).json({ success: false, message: 'Valid roles array is required' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { roles: updatedRoles },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await logAuditEvent({
      action: 'role_update',
      userId: req.user?._id,
      username: req.user?.username,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Updated roles for ${user.username} to [${updatedRoles.join(', ')}]`,
    });

    res.status(200).json({ success: true, user, message: 'User roles updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};

// Password-based fallback endpoints for testing
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      await logAuditEvent({
        action: 'login_failure',
        email: email?.toLowerCase(),
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Invalid email or password',
      });
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.roles = user.roles;
    }

    const token = generateToken(user._id.toString(), user.roles, user.email);

    await logAuditEvent({
      action: 'login_success',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.roles[0],
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Password login successful',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
        department: user.department,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName, email, username, password, role, roles, department } = req.body;
    const finalUsername = (username || email.split('@')[0]).toLowerCase().trim();
    const finalDisplayName = displayName || name || finalUsername;
    const finalRoles = roles || (role ? [role] : ['employee']);

    const user = await User.create({
      username: finalUsername,
      email: email.toLowerCase().trim(),
      displayName: finalDisplayName,
      name: finalDisplayName,
      password,
      roles: finalRoles,
      department,
    });

    const token = generateToken(user._id.toString(), user.roles, user.email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};
