import mongoose, { Document, Schema, Model } from 'mongoose';

export type PerformanceReviewStatus = 'Draft' | 'Submitted' | 'Approved' | 'Acknowledged';

export interface IPerformance extends Document {
  employeeId: mongoose.Types.ObjectId;
  reviewerId?: mongoose.Types.ObjectId;
  reviewPeriod: string;
  rating: number; // 1 to 5 scale
  goals: string[];
  goalsAchievedRate: number; // 0 to 100 percentage
  strengths?: string[];
  areasOfImprovement?: string[];
  feedback?: string;
  status: PerformanceReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const performanceSchema = new Schema<IPerformance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    reviewPeriod: {
      type: String,
      required: [true, 'Review period is required (e.g., 2026-Q1)'],
      trim: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Performance rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    goals: {
      type: [String],
      default: [],
    },
    goalsAchievedRate: {
      type: Number,
      default: 100,
      min: [0, 'Goal achievement rate cannot be negative'],
      max: [100, 'Goal achievement rate cannot exceed 100'],
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasOfImprovement: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Acknowledged'],
      default: 'Approved',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

performanceSchema.index({ employeeId: 1, reviewPeriod: 1 });

export const Performance: Model<IPerformance> =
  mongoose.models.Performance || mongoose.model<IPerformance>('Performance', performanceSchema);
