import mongoose, { Document, Schema, Model } from 'mongoose';

export type SkillCategory = 'Technical' | 'Leadership' | 'Domain' | 'Soft Skills' | 'Compliance';
export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface ISkill extends Document {
  name: string;
  category: SkillCategory;
  description?: string;
  departmentIds: mongoose.Types.ObjectId[];
  requiredHeadcount: number;
  benchmarkScore: number; // 1-100 target competency score
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: ['Technical', 'Leadership', 'Domain', 'Soft Skills', 'Compliance'],
      required: [true, 'Skill category is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    departmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    requiredHeadcount: {
      type: Number,
      default: 5,
      min: [0, 'Required headcount cannot be negative'],
    },
    benchmarkScore: {
      type: Number,
      default: 80,
      min: [1, 'Benchmark score must be between 1 and 100'],
      max: [100, 'Benchmark score must be between 1 and 100'],
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

skillSchema.index({ category: 1, name: 1 });

export const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema);
