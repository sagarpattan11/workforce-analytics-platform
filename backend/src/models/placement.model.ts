import mongoose, { Document, Schema, Model } from 'mongoose';

export type PlacementStage =
  | 'Applied'
  | 'Screened'
  | 'Interviewed'
  | 'Offered'
  | 'Placed'
  | 'Withdrawn'
  | 'Rejected';

export type PlacementStatus = 'In Progress' | 'Placed' | 'Failed';

export interface IPlacement extends Document {
  placementId: string;
  candidateName: string;
  candidateEmail: string;
  employeeId?: mongoose.Types.ObjectId; // Linked once placed into organization
  roleTitle: string;
  departmentId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  skills: string[];
  employer: string;
  location: string;
  applicationDate: Date;
  placementDate?: Date;
  probationEndDate?: Date;
  daysToPlace?: number;
  salary?: {
    baseSalary: number;
    bonus?: number;
    currency: string;
  };
  stage: PlacementStage;
  status: PlacementStatus;
  mentorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const placementSchema = new Schema<IPlacement>(
  {
    placementId: {
      type: String,
      required: [true, 'Placement ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      index: true,
    },
    candidateEmail: {
      type: String,
      required: [true, 'Candidate email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      index: true,
    },
    roleTitle: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    employer: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    applicationDate: {
      type: Date,
      required: [true, 'Application date is required'],
      index: true,
    },
    placementDate: {
      type: Date,
      index: true,
    },
    probationEndDate: {
      type: Date,
    },
    daysToPlace: {
      type: Number,
      min: [0, 'Days to place cannot be negative'],
    },
    salary: {
      baseSalary: {
        type: Number,
        min: [0, 'Base salary cannot be negative'],
      },
      bonus: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true,
      },
    },
    stage: {
      type: String,
      enum: ['Applied', 'Screened', 'Interviewed', 'Offered', 'Placed', 'Withdrawn', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    status: {
      type: String,
      enum: ['In Progress', 'Placed', 'Failed'],
      default: 'In Progress',
      index: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate placement records for the same candidate applying to the same employer and role
placementSchema.index({ candidateEmail: 1, employer: 1, roleTitle: 1 }, { unique: true });
placementSchema.index({ departmentId: 1, stage: 1 });
placementSchema.index({ location: 1, employer: 1 });

export const Placement: Model<IPlacement> =
  mongoose.models.Placement || mongoose.model<IPlacement>('Placement', placementSchema);
