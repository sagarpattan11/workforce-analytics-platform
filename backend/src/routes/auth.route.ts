import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { authLimiterMiddleware } from '../middleware/security.middleware';

const router = Router();

// Public Routes (Protected by auth rate limiter)
router.post('/register', authLimiterMiddleware, register);
router.post('/login', authLimiterMiddleware, login);
router.post('/logout', logout);

// Protected Routes
router.get('/me', authenticate, getMe);

// RBAC Protected Route (Strictly Admin only)
router.get('/admin-only', authenticate, authorize('Admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access granted',
  });
});

export default router;
