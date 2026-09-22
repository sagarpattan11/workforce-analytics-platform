import { Router } from 'express';
import {
  registerChallenge,
  registerVerify,
  loginChallenge,
  loginVerify,
  getMe,
  logout,
  listCredentials,
  renameCredential,
  revokeCredential,
  listUsers,
  updateUserRole,
  login,
  register,
} from '../controllers/auth.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { authLimiterMiddleware } from '../middleware/security.middleware';

const router = Router();

// ==========================================
// 1. WebAuthn / Passkey Registration Ceremony
// ==========================================
router.post('/register-challenge', authLimiterMiddleware, registerChallenge);
router.post('/register-verify', authLimiterMiddleware, registerVerify);
router.post('/passkey/register-options', authLimiterMiddleware, registerChallenge);
router.post('/passkey/verify-registration', authLimiterMiddleware, registerVerify);

// ==========================================
// 2. WebAuthn / Passkey Login Ceremony
// ==========================================
router.post('/login-challenge', authLimiterMiddleware, loginChallenge);
router.post('/login-verify', authLimiterMiddleware, loginVerify);

// ==========================================
// 3. Session Validation & Logout
// ==========================================
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);

// ==========================================
// 4. Credential Management (requireAuth)
// ==========================================
router.get('/credentials', requireAuth, listCredentials);
router.patch('/credentials/:id', requireAuth, renameCredential);
router.delete('/credentials/:id', requireAuth, revokeCredential);
router.get('/passkey/list', requireAuth, listCredentials);
router.patch('/passkey/:id', requireAuth, renameCredential);
router.delete('/passkey/:id', requireAuth, revokeCredential);

// ==========================================
// 5. Admin Role Management (requireRole('admin'))
// ==========================================
router.get('/users', requireAuth, requireRole('admin'), listUsers);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), updateUserRole);

// ==========================================
// 6. Password Fallback & RBAC Verification
// ==========================================
router.post('/login', authLimiterMiddleware, login);
router.post('/register', authLimiterMiddleware, register);
router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

export default router;
