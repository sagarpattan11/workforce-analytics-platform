import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/analytics/dashboard
 * Protected by authenticated session; aggregates 8 KPIs and 6 charts from MongoDB.
 */
router.get('/dashboard', requireAuth, getDashboardAnalytics);

export default router;
