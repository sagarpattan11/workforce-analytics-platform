import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
} from '../controllers/role.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All role endpoints are protected by authentication
router.get('/', requireAuth, getRoles);
router.get('/:id', requireAuth, getRoleById);
router.post('/', requireAuth, createRole);
router.put('/:id', requireAuth, updateRole);

export default router;
