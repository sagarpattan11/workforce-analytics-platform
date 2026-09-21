import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import passkeyRoute from './passkey.route';

const router = Router();

// Mount Routes
router.use('/', healthRoute);
router.use('/auth', authRoute);
router.use('/auth/passkey', passkeyRoute);

export default router;