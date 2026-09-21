import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, USER_ROLES, UserRole } from '../models/user.model';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logAuditEvent } from '../models/audit-log.model';

// Helper: Generate JWT Token
const generateToken = (id: string, role: UserRole, email: string): string => {
  return jwt.sign({ id, role, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

// Zod Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(USER_ROLES).default('Employee'),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/v1/auth/register
 * Register a new user with an enterprise role
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // Create user in MongoDB
    const user = await User.create(validatedData);

    // Generate token
    const token = generateToken(user._id.toString(), user.role, user.email);

    await logAuditEvent({
      action: 'USER_REGISTERED',
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: `User registered with role ${user.role}`,
    });

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to register user',
    });
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticate user and issue JWT token
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user and explicitly include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      await logAuditEvent({
        action: 'LOGIN_FAILURE',
        email: email.toLowerCase(),
        status: 'FAILURE',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Invalid email or password attempt',
      });
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'Invalid email or password.',
      });
      return;
    }

    if (!user.isActive) {
      await logAuditEvent({
        action: 'LOGIN_FAILURE',
        userId: user._id,
        email: user.email,
        role: user.role,
        status: 'FAILURE',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Account has been deactivated',
      });
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'This account has been deactivated.',
      });
      return;
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role, user.email);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logAuditEvent({
      action: 'LOGIN_SUCCESS',
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Password login successful',
    });

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'An error occurred during login',
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Retrieve profile of the currently authenticated user
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    status: 'success',
    data: {
      user: {
        id: req.user?._id,
        name: req.user?.name,
        email: req.user?.email,
        role: req.user?.role,
        department: req.user?.department,
        lastLogin: req.user?.lastLogin,
        createdAt: req.user?.createdAt,
      },
    },
  });
};

/**
 * POST /api/v1/auth/logout
 * Clear authentication session
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  await logAuditEvent({
    action: 'LOGOUT',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'SUCCESS',
    details: 'User logged out',
  });

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Logged out successfully',
  });
};
