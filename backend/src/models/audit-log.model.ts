import mongoose, { Document, Schema, Model } from 'mongoose';

export type AuditAction =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSKEY_REGISTERED'
  | 'PASSKEY_LOGIN_SUCCESS'
  | 'PASSKEY_LOGIN_FAILURE'
  | 'PASSKEY_RENAMED'
  | 'PASSKEY_REVOKED';

export interface IAuditLog extends Document {
  action: AuditAction;
  userId?: mongoose.Types.ObjectId;
  email?: string;
  role?: string;
  status: 'SUCCESS' | 'FAILURE';
  ip?: string;
  userAgent?: string;
  details?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable audit records
  }
);

// Helper function to easily log an event from controllers
export const logAuditEvent = async (data: {
  action: AuditAction;
  userId?: mongoose.Types.ObjectId | string;
  email?: string;
  role?: string;
  status: 'SUCCESS' | 'FAILURE';
  ip?: string;
  userAgent?: string;
  details?: string;
}): Promise<void> => {
  try {
    await AuditLog.create(data);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
