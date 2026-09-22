import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Enterprise Roles enum matching specification
export const USER_ROLES = ['admin', 'manager', 'employee'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// User Interface
export interface IUser extends Document {
  username: string;
  email: string;
  displayName: string;
  name?: string; // alias for displayName
  password?: string;
  roles: UserRole[];
  role?: string; // single role helper
  department?: string;
  currentChallenge?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Hidden by default
    },
    roles: {
      type: [String],
      enum: {
        values: USER_ROLES,
        message: '{VALUE} is not a valid enterprise role',
      },
      default: ['employee'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    currentChallenge: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtuals / hooks to sync name and displayName
userSchema.pre('save', async function () {
  if (this.displayName && !this.name) {
    this.name = this.displayName;
  } else if (this.name && !this.displayName) {
    this.displayName = this.name;
  }

  if (!this.username && this.email) {
    this.username = this.email.split('@')[0].toLowerCase();
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Instance Method: Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
