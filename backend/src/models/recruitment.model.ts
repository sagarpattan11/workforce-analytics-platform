import mongoose, { Document, Schema, Model } from 'mongoose';

export type RequisitionStatus = 'Open' | 'Interviewing' | 'Offer Sent' | 'Closed' | 'Cancelled';
export type RequisitionPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SourcingChannel = 'LinkedIn' | 'Referral' | 'Career Portal' | 'Campus' | 'Agency' | 'Direct';

export interface IRecruitment extends Document {
  requisitionNumber: string;
  title: string;
  departmentId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  location: string;
  openPositions: number;
  filledPositions: number;
  applicationsCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersCount: number;
  hiresCount: number; // matches filledPositions
  timeToHireDays: number;
  costPerHire: number;
  offerAcceptanceRate: number; // Percentage (e.g. 85.5)
  sourcingChannel: SourcingChannel;
  skillsRequired: string[];
  targetHireDate?: Date;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  hiringManagerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const recruitmentSchema = new Schema<IRecruitment>(
  {
    requisitionNumber: {
      type: String,
      required: [true, 'Requisition number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Requisition job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
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
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    openPositions: {
      type: Number,
      required: [true, 'Number of open positions is required'],
      min: [1, 'Must have at least 1 open position'],
      default: 1,
    },
    filledPositions: {
      type: Number,
      default: 0,
      min: [0, 'Filled positions cannot be negative'],
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: [0, 'Applications count cannot be negative'],
    },
    shortlistedCount: {
      type: Number,
      default: 0,
      min: [0, 'Shortlisted count cannot be negative'],
    },
    interviewedCount: {
      type: Number,
      default: 0,
      min: [0, 'Interviewed count cannot be negative'],
    },
    offersCount: {
      type: Number,
      default: 0,
      min: [0, 'Offers count cannot be negative'],
    },
    hiresCount: {
      type: Number,
      default: 0,
      min: [0, 'Hires count cannot be negative'],
    },
    timeToHireDays: {
      type: Number,
      default: 25,
      min: [0, 'Time to hire cannot be negative'],
    },
    costPerHire: {
      type: Number,
      default: 4000,
      min: [0, 'Cost per hire cannot be negative'],
    },
    offerAcceptanceRate: {
      type: Number,
      default: 80,
      min: [0, 'Acceptance rate cannot be negative'],
      max: [100, 'Acceptance rate cannot exceed 100%'],
    },
    sourcingChannel: {
      type: String,
      enum: ['LinkedIn', 'Referral', 'Career Portal', 'Campus', 'Agency', 'Direct'],
      default: 'LinkedIn',
      index: true,
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    targetHireDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Interviewing', 'Offer Sent', 'Closed', 'Cancelled'],
      default: 'Open',
      index: true,
    },
    hiringManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

recruitmentSchema.index({ departmentId: 1, status: 1 });
recruitmentSchema.index({ location: 1, sourcingChannel: 1 });

export const Recruitment: Model<IRecruitment> =
  mongoose.models.Recruitment || mongoose.model<IRecruitment>('Recruitment', recruitmentSchema);
