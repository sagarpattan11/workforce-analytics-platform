import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} from '../controllers/department.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * All department routes are protected by authenticated sessions.
 * In accordance with Day 4 requirements, any authenticated user can view & create departments.
 */

// GET /api/v1/departments -> List all departments
router.get('/', requireAuth, getDepartments);

// GET /api/v1/departments/:id -> Get single department by ID or Code
router.get('/:id', requireAuth, getDepartmentById);

// POST /api/v1/departments -> Create new department
router.post('/', requireAuth, createDepartment);

// PUT /api/v1/departments/:id -> Update department
router.put('/:id', requireAuth, updateDepartment);

export default router;
