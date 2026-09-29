import { Request, Response } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import jwt from 'jsonwebtoken';
import { webAuthnConfig } from '../config/webauthn';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { Passkey } from '../models/passkey.model';
import { Challenge } from '../models/challenge.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logAuditEvent } from '../models/audit-log.model';

/**
 * 1. POST /api/v1/auth/passkey/register-options
 * Generates cryptographic challenge for registering a new passkey
 */
export const getRegisterOptions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Get user's existing passkeys to prevent re-registering the same key
    const existingPasskeys = await Passkey.find({ userId: user._id });

    const options = await generateRegistrationOptions({
      rpName: webAuthnConfig.rpName,
      rpID: webAuthnConfig.rpID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      timeout: webAuthnConfig.timeout,
      attestationType: webAuthnConfig.attestationType,
      excludeCredentials: existingPasskeys.map((pk) => ({
        id: pk.credentialID,
        transports: pk.transports as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Supports both platform (Windows Hello/TouchID) and cross-platform (USB/NFC security keys)
      },
    });

    // Save single-use challenge with 5-min TTL
    await Challenge.create({
      challenge: options.challenge,
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(200).json({ success: true, options });
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ success: false, message: 'Failed to generate passkey registration options' });
  }
};

/**
 * 2. POST /api/v1/auth/passkey/verify-registration
 * Verifies authenticator signature and stores the passkey in MongoDB
 */
export const verifyRegistration = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { registrationResponse, nickname } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Retrieve and verify challenge
    const savedChallenge = await Challenge.findOne({
      userId: user._id.toString(),
    }).sort({ createdAt: -1 });

    if (!savedChallenge) {
      res.status(400).json({
        success: false,
        message: 'Registration challenge expired or not found. Please try again.',
      });
      return;
    }

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: savedChallenge.challenge,
      expectedOrigin: webAuthnConfig.expectedOrigin,
      expectedRPID: webAuthnConfig.rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ success: false, message: 'Passkey verification failed' });
      return;
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Convert public key to Buffer
    const credentialPublicKeyBuffer = Buffer.from(credential.publicKey);

    // Save Passkey in MongoDB Atlas
    await Passkey.create({
      userId: user._id,
      credentialID: credential.id,
      credentialPublicKey: credentialPublicKeyBuffer,
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: registrationResponse.response?.transports || ['internal'],
      nickname: nickname || (credentialDeviceType === 'singleDevice' ? 'Security Key / Device' : 'Cloud Passkey'),
    });

    // Delete used challenge
    await Challenge.deleteMany({ userId: user._id.toString() });

    await logAuditEvent({
      action: 'PASSKEY_REGISTERED',
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Registered ${credentialDeviceType} passkey: "${nickname || 'Security Key'}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Passkey registered successfully! You can now use it to sign in.',
    });
  } catch (error) {
    console.error('Error verifying passkey registration:', error);
    res.status(500).json({ success: false, message: 'Failed to verify passkey registration' });
  }
};

/**
 * 3. POST /api/v1/auth/passkey/login-options
 * Generates authentication challenge for signing in with Passkey / Security Key
 */
export const getLoginOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] | undefined;

    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        const userPasskeys = await Passkey.find({ userId: user._id });
        allowCredentials = userPasskeys.map((pk) => ({
          id: pk.credentialID,
          transports: pk.transports as AuthenticatorTransport[],
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: webAuthnConfig.rpID,
      timeout: webAuthnConfig.timeout,
      userVerification: 'preferred',
      allowCredentials,
    });

    // Save challenge
    await Challenge.create({
      challenge: options.challenge,
      email: email ? email.toLowerCase() : undefined,
    });

    res.status(200).json({ success: true, options });
  } catch (error) {
    console.error('Error generating login options:', error);
    res.status(500).json({ success: false, message: 'Failed to generate passkey login options' });
  }
};

/**
 * 4. POST /api/v1/auth/passkey/verify-login
 * Verifies signature from Windows Hello / Touch ID / YubiKey and starts user session
 */
export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authenticationResponse } = req.body;

    if (!authenticationResponse || !authenticationResponse.id) {
      res.status(400).json({ success: false, message: 'Invalid authentication response' });
      return;
    }

    // Find the passkey by its credentialID
    const passkey = await Passkey.findOne({ credentialID: authenticationResponse.id });
    if (!passkey) {
      res.status(404).json({
        success: false,
        message: 'No registered passkey found for this device. Please register first.',
      });
      return;
    }

    // Find the associated user
    const user = await User.findById(passkey.userId);
    if (!user || !user.isActive) {
      res.status(403).json({ success: false, message: 'User account not found or deactivated' });
      return;
    }

    // Find the challenge
    const savedChallenge = await Challenge.findOne().sort({ createdAt: -1 });
    if (!savedChallenge) {
      res.status(400).json({
        success: false,
        message: 'Authentication challenge expired. Please try again.',
      });
      return;
    }

    // Verify signature
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: savedChallenge.challenge,
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

    // Update passkey counter and lastUsedAt timestamp
    passkey.counter = verification.authenticationInfo.newCounter;
    passkey.lastUsedAt = new Date();
    await passkey.save();

    // Update user last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Clean up challenge
    await Challenge.deleteMany({ challenge: savedChallenge.challenge });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAuditEvent({
      action: 'PASSKEY_LOGIN_SUCCESS',
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Signed in via Passkey: "${passkey.nickname}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully via Passkey!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error) {
    console.error('Error verifying passkey login:', error);

    await logAuditEvent({
      action: 'PASSKEY_LOGIN_FAILURE',
      status: 'FAILURE',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: (error as Error).message || 'Passkey authentication failed',
    });

    res.status(500).json({ success: false, message: 'Passkey authentication failed' });
  }
};

/**
 * 5. GET /api/v1/auth/passkey/list
 * Returns all passkeys registered by the current user
 */
export const listPasskeys = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const passkeys = await Passkey.find({ userId: req.user?._id })
      .select('credentialID nickname deviceType transports createdAt lastUsedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: passkeys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve passkeys' });
  }
};

/**
 * 6. PATCH /api/v1/auth/passkey/:id/rename
 * Renames an existing passkey
 */
export const renamePasskey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string') {
      res.status(400).json({ success: false, message: 'Valid nickname is required' });
      return;
    }

    const passkey = await Passkey.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { nickname: nickname.trim() },
      { new: true }
    );

    if (!passkey) {
      res.status(404).json({ success: false, message: 'Passkey not found or unauthorized' });
      return;
    }

    await logAuditEvent({
      action: 'PASSKEY_RENAMED',
      userId: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Passkey renamed to "${nickname.trim()}"`,
    });

    res.status(200).json({ success: true, message: 'Passkey renamed successfully', data: passkey });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to rename passkey' });
  }
};

/**
 * 7. DELETE /api/v1/auth/passkey/:id
 * Revokes/deletes a registered passkey
 */
export const revokePasskey = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await Passkey.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });

    if (!result) {
      res.status(404).json({ success: false, message: 'Passkey not found or unauthorized' });
      return;
    }

    await logAuditEvent({
      action: 'PASSKEY_REVOKED',
      userId: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Passkey "${result.nickname}" (${result.credentialID}) revoked`,
    });

    res.status(200).json({ success: true, message: 'Passkey revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to revoke passkey' });
  }
};
