import mongoose, { Document, Schema, Model } from 'mongoose';

export type PlacementStatus = 'Probation' | 'Confirmed' | 'Transferred' | 'Completed';

export interface IPlacement extends Document {
  placementId: string;
  employeeId: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  location: string;
  placementDate: Date;
  probationEndDate?: Date;
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
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
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
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    placementDate: {
      type: Date,
      required: [true, 'Placement date is required'],
      index: true,
    },
    probationEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Probation', 'Confirmed', 'Transferred', 'Completed'],
      default: 'Probation',
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

export const Placement: Model<IPlacement> =
  mongoose.models.Placement || mongoose.model<IPlacement>('Placement', placementSchema);
