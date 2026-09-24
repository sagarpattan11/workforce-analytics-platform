import mongoose, { Document, Schema, Model } from 'mongoose';

export type WorkLocationType = 'Office' | 'Work From Home' | 'Hybrid';

export interface ILocation extends Document {
  name: string;
  code: string;
  city: string;
  country: string;
  address?: string;
  type: WorkLocationType;
  capacity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Location name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Location code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [20, 'Location code cannot exceed 20 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Office', 'Work From Home', 'Hybrid'],
      default: 'Office',
      index: true,
    },
    capacity: {
      type: Number,
      min: [0, 'Capacity cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Location: Model<ILocation> =
  mongoose.models.Location || mongoose.model<ILocation>('Location', locationSchema);
