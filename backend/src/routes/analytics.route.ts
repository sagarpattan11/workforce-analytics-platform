import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { getPlacementAnalytics } from '../controllers/placement.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/v1/analytics/dashboard
 * Protected by authenticated session; aggregates 8 KPIs and 6 charts from MongoDB.
 */
router.get('/dashboard', requireAuth, getDashboardAnalytics);

/**
 * GET /api/v1/analytics/placement
 * Protected by authenticated session; aggregates Placement KPIs, funnels, salary stats, and breakdowns.
 */
router.get('/placement', requireAuth, getPlacementAnalytics);

export default router;
