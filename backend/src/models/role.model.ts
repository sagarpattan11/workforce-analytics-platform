import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string;
  departmentId: mongoose.Types.ObjectId;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Role code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [20, 'Role code cannot exceed 20 characters'],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    level: {
      type: String,
      enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Executive'],
      default: 'Mid',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    permissions: {
      type: [String],
      default: [],
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

roleSchema.index({ departmentId: 1, name: 1 });

export const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);
