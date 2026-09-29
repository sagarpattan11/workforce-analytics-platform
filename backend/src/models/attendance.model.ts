import mongoose, { Document, Schema, Model } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Late' | 'Half-day' | 'Absent' | 'On Leave';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  workLocation: 'Office' | 'Work From Home' | 'Hybrid';
  hoursWorked?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-day', 'Absent', 'On Leave'],
      default: 'Present',
      index: true,
    },
    workLocation: {
      type: String,
      enum: ['Office', 'Work From Home', 'Hybrid'],
      default: 'Office',
    },
    hoursWorked: {
      type: Number,
      min: [0, 'Hours worked cannot be negative'],
      max: [24, 'Hours worked cannot exceed 24'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, 'Notes cannot exceed 250 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);
