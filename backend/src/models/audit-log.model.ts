import mongoose, { Document, Schema, Model } from 'mongoose';

export const AUTH_AUDIT_ACTIONS = [
  'register_challenge',
  'register_success',
  'register_failure',
  'login_challenge',
  'login_success',
  'login_failure',
  'logout',
  'credential_rename',
  'credential_revoke',
  'role_update',
  // legacy aliases
  'USER_REGISTERED',
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'LOGOUT',
  'PASSKEY_REGISTERED',
  'PASSKEY_LOGIN_SUCCESS',
  'PASSKEY_LOGIN_FAILURE',
  'PASSKEY_RENAMED',
  'PASSKEY_REVOKED',
] as const;

export type AuthAuditAction = (typeof AUTH_AUDIT_ACTIONS)[number];

export interface IAuthAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  username?: string;
  email?: string;
  role?: string;
  action: AuthAuditAction;
  success: boolean;
  status?: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  ip?: string;
  userAgent: string;
  failureReason?: string;
  details?: string;
  createdAt: Date;
}

const authAuditLogSchema = new Schema<IAuthAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    failureReason: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Helper function to easily log an event
export const logAuditEvent = async (data: {
  action: AuthAuditAction | string;
  userId?: mongoose.Types.ObjectId | string;
  username?: string;
  email?: string;
  role?: string;
  success?: boolean;
  status?: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  ip?: string;
  userAgent?: string;
  failureReason?: string;
  details?: string;
}): Promise<void> => {
  try {
    const isSuccess = data.success !== undefined ? data.success : data.status === 'SUCCESS';
    await AuthAuditLog.create({
      userId: data.userId,
      username: data.username || (data.email ? data.email.split('@')[0] : undefined),
      email: data.email,
      role: data.role,
      action: data.action as AuthAuditAction,
      success: isSuccess,
      ipAddress: data.ipAddress || data.ip || 'unknown',
      userAgent: data.userAgent || 'unknown',
      failureReason: data.failureReason || (!isSuccess ? data.details : undefined),
      details: data.details,
    });
  } catch (err) {
    console.error('Failed to write auth audit log:', err);
  }
};

export const AuthAuditLog: Model<IAuthAuditLog> = mongoose.model<IAuthAuditLog>(
  'AuthAuditLog',
  authAuditLogSchema
);
export const AuditLog = AuthAuditLog;
export default AuthAuditLog;
