import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPasskey extends Document {
  userId: mongoose.Types.ObjectId;
  credentialID: string; // Base64URL credential ID
  credentialPublicKey: Buffer; // Public key for signature verification
  counter: number; // Monotonically increasing signature counter
  deviceType: 'singleDevice' | 'multiDevice';
  backedUp: boolean;
  transports: string[]; // e.g. ['internal', 'usb', 'nfc', 'ble', 'hybrid']
  nickname: string; // User-defined name, e.g. "Windows Hello Laptop", "YubiKey 5C"
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
    deviceType: {
      type: String,
      enum: ['singleDevice', 'multiDevice'],
      default: 'singleDevice',
    },
    backedUp: {
      type: Boolean,
      default: false,
    },
    transports: {
      type: [String],
      default: ['internal'],
    },
    nickname: {
      type: String,
      trim: true,
      default: 'Passkey',
      maxlength: [60, 'Nickname cannot exceed 60 characters'],
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

export const Passkey: Model<IPasskey> = mongoose.model<IPasskey>('Passkey', passkeySchema);
export default Passkey;
