import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPasskey extends Document {
  userId: mongoose.Types.ObjectId;
  credentialID: string; // Base64URL credential ID
  credentialPublicKey: Buffer; // Public key for signature verification
  counter: number; // Monotonically increasing signature counter
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  backedUp?: boolean;
  transports: string[]; // e.g. ['internal', 'usb', 'nfc', 'ble', 'hybrid']
  friendlyName: string; // e.g. "Windows (Chrome Passkey)"
  nickname?: string; // alias
  deviceType?: string; // alias
  aaguid?: string;
  createdAt: Date;
  lastUsedAt: Date;
}

const passkeySchema = new Schema<IPasskey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    credentialID: {
      type: String,
      required: [true, 'Credential ID is required'],
      unique: true,
      index: true,
    },
    credentialPublicKey: {
      type: Buffer,
      required: [true, 'Credential public key is required'],
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    credentialDeviceType: {
      type: String,
      default: 'singleDevice',
    },
    credentialBackedUp: {
      type: Boolean,
      default: false,
    },
    backedUp: {
      type: Boolean,
    },
    transports: {
      type: [String],
      default: ['internal'],
    },
    friendlyName: {
      type: String,
      required: [true, 'Friendly name is required'],
      trim: true,
      default: 'Security Key / Device',
      maxlength: [100, 'Friendly name cannot exceed 100 characters'],
    },
    nickname: {
      type: String,
      trim: true,
    },
    deviceType: {
      type: String,
    },
    aaguid: {
      type: String,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Sync nickname and friendlyName
passkeySchema.pre('save', async function () {
  if (this.friendlyName && !this.nickname) {
    this.nickname = this.friendlyName;
  } else if (this.nickname && !this.friendlyName) {
    this.friendlyName = this.nickname;
  }

  if (this.credentialDeviceType && !this.deviceType) {
    this.deviceType = this.credentialDeviceType;
  } else if (this.deviceType && !this.credentialDeviceType) {
    this.credentialDeviceType = this.deviceType;
  }
});

export const Passkey: Model<IPasskey> = mongoose.model<IPasskey>('Passkey', passkeySchema);
export default Passkey;
