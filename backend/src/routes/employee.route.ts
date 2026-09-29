import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  restoreEmployee,
} from '../controllers/employee.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * All employee routes are protected by authenticated sessions.
 * Any authenticated user can view, create, update, and soft-delete employees.
 */

// GET /api/v1/employees -> Paginated, searchable, filterable list
router.get('/', requireAuth, getEmployees);

// GET /api/v1/employees/:id -> Single employee details
router.get('/:id', requireAuth, getEmployeeById);

// POST /api/v1/employees -> Create new employee
router.post('/', requireAuth, createEmployee);

// PUT /api/v1/employees/:id -> Update employee details
router.put('/:id', requireAuth, updateEmployee);

// PATCH /api/v1/employees/:id/status -> Quick status update (Active, On Leave, etc.)
router.patch('/:id/status', requireAuth, updateEmployeeStatus);

// PATCH /api/v1/employees/:id/restore -> Restore a soft-deleted employee to Active
router.patch('/:id/restore', requireAuth, restoreEmployee);

// DELETE /api/v1/employees/:id -> Soft delete employee
router.delete('/:id', requireAuth, deleteEmployee);

export default router;
