import mongoose, { Document, Schema, Model } from 'mongoose';

export type LearningStatus = 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';

export interface ILearningRecord extends Document {
  recordId: string;
  employeeId: mongoose.Types.ObjectId;
  trainingId: mongoose.Types.ObjectId;
  targetSkillId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  status: LearningStatus;
  enrolmentDate: Date;
  completionDate?: Date;
  progressPct: number; // 0 to 100
  hoursSpent: number;
  assessmentScore?: number; // 0 to 100
  passedAssessment?: boolean; // assessmentScore >= 75
  certificationEarned?: boolean;
  certificateName?: string;
  certificateId?: string;
  effectivenessRating?: number; // 1.0 to 5.0 (manager/peer feedback)
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const learningRecordSchema = new Schema<ILearningRecord>(
  {
    recordId: {
      type: String,
      required: [true, 'Record ID is required'],
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
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: [true, 'Training course reference is required'],
      index: true,
    },
    targetSkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Target skill reference is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Enrolled', 'In Progress', 'Completed', 'Dropped'],
      default: 'Enrolled',
      index: true,
    },
    enrolmentDate: {
      type: Date,
      required: [true, 'Enrolment date is required'],
      index: true,
    },
    completionDate: {
      type: Date,
      index: true,
    },
    progressPct: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
    },
    hoursSpent: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Hours spent cannot be negative'],
    },
    assessmentScore: {
      type: Number,
      min: [0, 'Assessment score cannot be negative'],
      max: [100, 'Assessment score cannot exceed 100'],
    },
    passedAssessment: {
      type: Boolean,
      default: false,
    },
    certificationEarned: {
      type: Boolean,
      default: false,
      index: true,
    },
    certificateName: {
      type: String,
      trim: true,
    },
    certificateId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    effectivenessRating: {
      type: Number,
      min: [1, 'Effectiveness rating minimum is 1'],
      max: [5, 'Effectiveness rating maximum is 5'],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate enrolment records for the same employee in the same training course
learningRecordSchema.index({ employeeId: 1, trainingId: 1 }, { unique: true });
learningRecordSchema.index({ departmentId: 1, status: 1 });
learningRecordSchema.index({ targetSkillId: 1, passedAssessment: 1 });

export const LearningRecord: Model<ILearningRecord> =
  mongoose.models.LearningRecord || mongoose.model<ILearningRecord>('LearningRecord', learningRecordSchema);
