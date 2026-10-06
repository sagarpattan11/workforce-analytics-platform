import { Router } from 'express';
import {
  getSkillDevelopmentReport,
  exportReport,
} from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/reports/skill-development
 * Protected by authenticated session; returns employee skill growth, baseline vs post-training ratings,
 * and closed skill gap metrics.
 */
router.get('/skill-development', requireAuth, getSkillDevelopmentReport);

/**
 * GET /api/v1/reports/export
 * Protected by authenticated session & RBAC; streams CSV, Excel, or printable PDF summaries.
 */
router.get('/export', requireAuth, exportReport);

export default router;
