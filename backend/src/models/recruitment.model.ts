import mongoose, { Document, Schema, Model } from 'mongoose';

export type RequisitionStatus = 'Open' | 'Interviewing' | 'Offer Sent' | 'Closed' | 'Cancelled';
export type RequisitionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IRecruitment extends Document {
  requisitionNumber: string;
  title: string;
  departmentId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  location: string;
  openPositions: number;
  filledPositions: number;
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

export const Recruitment: Model<IRecruitment> =
  mongoose.models.Recruitment || mongoose.model<IRecruitment>('Recruitment', recruitmentSchema);
