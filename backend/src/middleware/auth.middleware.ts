import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser, UserRole } from '../models/user.model';

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role?: string;
  roles?: string[];
  email: string;
}

/**
 * Middleware: Verify Authentication
 * Validates active session via express-session (req.session.userId) or Bearer JWT token fallback
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check Authorization header (Bearer token)
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'The user belonging to this token no longer exists or is inactive.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid or expired token. Please sign in again.',
    });
  }
};



/**
 * Middleware: Authorize by Role (RBAC)
 * Supports 'admin', 'manager', 'employee' or custom enterprise roles
 */
export const requireRole = (...allowedRoles: (UserRole | string)[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'User is not authenticated.',
      });
      return;
    }

    const userRoles: string[] = req.user.roles || (req.user.role ? [req.user.role] : []);
    const normalizedUserRoles = userRoles.map((r) => r.toLowerCase());
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    const hasPermission = normalizedAllowed.some((r) => normalizedUserRoles.includes(r));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: `Access denied. Authorized roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

// Aliases for backward compatibility
export const authenticate = requireAuth;
export const authorize = requireRole;
