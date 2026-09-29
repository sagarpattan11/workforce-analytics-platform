import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITraining extends Document {
  title: string;
  category: 'Technical' | 'Leadership' | 'Domain' | 'Soft Skills' | 'Compliance';
  description?: string;
  targetSkillId?: mongoose.Types.ObjectId;
  durationHours: number;
  provider: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolledEmployees: mongoose.Types.ObjectId[];
  completedEmployees: mongoose.Types.ObjectId[];
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    title: {
      type: String,
      required: [true, 'Training course title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Domain', 'Soft Skills', 'Compliance'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    targetSkillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      index: true,
    },
    durationHours: {
      type: Number,
      required: [true, 'Duration in hours is required'],
      min: [1, 'Duration must be at least 1 hour'],
    },
    provider: {
      type: String,
      default: 'Internal Academy',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    enrolledEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    completedEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
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

export const Training: Model<ITraining> =
  mongoose.models.Training || mongoose.model<ITraining>('Training', trainingSchema);
