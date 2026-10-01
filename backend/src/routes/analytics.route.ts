import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { getPlacementAnalytics } from '../controllers/placement.controller';
import { getRecruitmentAnalytics } from '../controllers/recruitment.controller';
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

/**
 * GET /api/v1/analytics/recruitment
 * Protected by authenticated session; aggregates Recruitment KPIs, 5-stage funnel, sourcing channel efficiency, and requisitions.
 */
router.get('/recruitment', requireAuth, getRecruitmentAnalytics);

export default router;
