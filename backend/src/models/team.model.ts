import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * 1. TypeScript Interface for Team document
 */
export interface ITeam extends Document {
  name: string;
  code: string;
  departmentId: mongoose.Types.ObjectId;
  description?: string;
  leadId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 2. Mongoose Schema for Team
 */
const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Team code is required'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Team code must be at least 2 characters (e.g., FE, BE, QA)'],
      maxlength: [10, 'Team code cannot exceed 10 characters'],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
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

// Compound index: A team code should be unique within a department
teamSchema.index({ departmentId: 1, code: 1 }, { unique: true });

/**
 * 3. Mongoose Model
 */
export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

export default Team;
