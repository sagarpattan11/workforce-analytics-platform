import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * 1. TypeScript Types & Interface for Employee
 */
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';

export interface IEmployeeSkill {
  skillId?: mongoose.Types.ObjectId;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  certified?: boolean;
}

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  roleId?: mongoose.Types.ObjectId;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  location: string;
  workLocationType?: 'Office' | 'Work From Home' | 'Hybrid';
  hireDate: Date;
  yearsOfExperience?: number;
  salary?: number;
  avatarUrl?: string;
  skills?: IEmployeeSkill[];
  exitDate?: Date;
  exitReason?: string;
  isDeleted: boolean; // Soft delete flag
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName: string; // Virtual property
}

/**
 * 2. Mongoose Schema
 */
const employeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name cannot be empty'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name cannot be empty'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      index: true,
    },
    position: {
      type: String,
      required: [true, 'Job position is required'],
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      default: 'Full-time',
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
      default: 'Active',
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      index: true,
    },
    workLocationType: {
      type: String,
      enum: ['Office', 'Work From Home', 'Hybrid'],
      default: 'Office',
      index: true,
    },
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required'],
      index: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 2,
      min: [0, 'Years of experience cannot be negative'],
      index: true,
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    skills: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Intermediate',
        },
        certified: { type: Boolean, default: false },
      },
    ],
    exitDate: {
      type: Date,
      default: null,
    },
    exitReason: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Crucial for filtering out deleted employees in all queries
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for combined Full Name
employeeSchema.virtual('fullName').get(function (this: IEmployee) {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Compound indexes for fast filtering and analytics
employeeSchema.index({ departmentId: 1, status: 1, isDeleted: 1 });
employeeSchema.index({ status: 1, isDeleted: 1 });
employeeSchema.index({ hireDate: -1, isDeleted: 1 });

// Full-text search index for fast multi-field search (name, email, ID, role)
employeeSchema.index(
  {
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    employeeId: 'text',
    position: 'text',
  },
  {
    weights: {
      employeeId: 10,
      email: 8,
      firstName: 5,
      lastName: 5,
      position: 3,
    },
    name: 'EmployeeTextSearchIndex',
  }
);

/**
 * 3. Mongoose Model
 */
export const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee;
