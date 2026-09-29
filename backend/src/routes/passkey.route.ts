import { Router } from 'express';
import {
  getRegisterOptions,
  verifyRegistration,
  getLoginOptions,
  verifyLogin,
  listPasskeys,
  renamePasskey,
  revokePasskey,
} from '../controllers/passkey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiterMiddleware } from '../middleware/security.middleware';

const router = Router();

// Public Passkey Authentication Routes (Rate limited)
router.post('/login-options', authLimiterMiddleware, getLoginOptions);
router.post('/verify-login', authLimiterMiddleware, verifyLogin);

// Protected Passkey Management Routes (Requires active session)
router.post('/register-options', authenticate, getRegisterOptions);
router.post('/verify-registration', authenticate, verifyRegistration);
router.get('/list', authenticate, listPasskeys);
router.patch('/:id/rename', authenticate, renamePasskey);
router.delete('/:id', authenticate, revokePasskey);

export default router;
