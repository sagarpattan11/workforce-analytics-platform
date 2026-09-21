import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser, UserRole } from '../models/user.model';

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

/**
 * Middleware: Verify JWT Authentication Token
 * Validates token from Authorization header (Bearer <token>) or HTTP cookie
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check HTTP-only cookie as fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Authentication required. Please provide a valid authorization token.',
    });
    return;
  }

  try {
    // Verify token signature
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Check if user still exists in database
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
      return;
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }
};

/**
 * Middleware: Authorize by Role (RBAC)
 * Restricts endpoint access to specific roles among the 6 enterprise roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'User is not authenticated.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
};
