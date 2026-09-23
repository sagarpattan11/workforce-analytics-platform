import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * 1. TypeScript Interface: Defines the type structure for a Department document.
 * This gives us full type safety in TypeScript across controllers and queries.
 */
export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  managerId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 2. Mongoose Schema: Defines how MongoDB stores and validates Department documents.
 */
const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Department name must be at least 2 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [2, 'Department code must be at least 2 characters (e.g. ENG, HR)'],
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    managerId: {
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
    timestamps: true, // Automatically manages createdAt and updatedAt fields
    versionKey: false, // Disables the __v field in MongoDB
  }
);

// Compound / unique indexing for fast lookup
departmentSchema.index({ code: 1, isActive: 1 });

/**
 * 3. Mongoose Model: The compiled model used to run queries (find, create, update, etc.)
 */
export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;
