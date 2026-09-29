import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
} from '../controllers/role.controller';

const router = Router();

router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.put('/:id', updateRole);

export default router;
