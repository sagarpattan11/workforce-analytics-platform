import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChallenge extends Document {
  challenge: string;
  userId?: string; // Optional (for registration or known user login)
  email?: string; // For passwordless discovery
  createdAt: Date;
}

const challengeSchema = new Schema<IChallenge>(
  {
    challenge: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
    },
    email: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // MongoDB automatically deletes challenges after 5 minutes (300s TTL)
    },
  },
  {
    timestamps: false,
  }
);

export const Challenge: Model<IChallenge> = mongoose.model<IChallenge>('Challenge', challengeSchema);
export default Challenge;
