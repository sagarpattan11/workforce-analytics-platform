import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';
import { getPlacementAnalytics } from '../controllers/placement.controller';
import { getRecruitmentAnalytics } from '../controllers/recruitment.controller';
import { getLearningAnalytics } from '../controllers/learning.controller';
import {
  getAttritionAnalytics,
  getAttritionExplainability,
  recalculateAttritionPredictions,
  getEmployeeAttritionPrediction,
} from '../controllers/attrition.controller';
import {
  getDemandForecasting,
  simulateScenario,
  getSavedScenarios,
  getScenarioCatalog,
} from '../controllers/planning.controller';
import { getPerformanceReport } from '../controllers/performance-report.controller';
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

/**
 * GET /api/v1/analytics/learning
 * Protected by authenticated session; aggregates Learning & Development KPIs, score distributions, and course breakdowns.
 */
router.get('/learning', requireAuth, getLearningAnalytics);

/**
 * GET /api/v1/analytics/attrition
 * Protected by authenticated session; Attrition Risk Overview Analytics
 */
router.get('/attrition', requireAuth, getAttritionAnalytics);

/**
 * GET /api/v1/analytics/attrition/explainability
 * Protected by authenticated session; Model Explainability & Quality Metrics
 */
router.get('/attrition/explainability', requireAuth, getAttritionExplainability);

/**
 * POST /api/v1/analytics/attrition/recalculate
 * Protected by authenticated session; Batch Recalculate Attrition Predictions
 */
router.post('/attrition/recalculate', requireAuth, recalculateAttritionPredictions);

/**
 * GET /api/v1/analytics/attrition/employee/:employeeId
 * Protected by authenticated session; Single Employee Attrition Prediction
 */
router.get('/attrition/employee/:employeeId', requireAuth, getEmployeeAttritionPrediction);

/**
 * GET /api/v1/analytics/demand-forecasting
 * Protected by authenticated session; Demand Forecasting Projections & Shortages
 */
router.get('/demand-forecasting', requireAuth, getDemandForecasting);

/**
 * POST /api/v1/analytics/workforce-planning/simulate
 * Protected by authenticated session; Runs Scenario Simulation
 */
router.post('/workforce-planning/simulate', requireAuth, simulateScenario);

/**
 * GET /api/v1/analytics/workforce-planning/scenarios
 * Protected by authenticated session; Saved Workforce Scenarios
 */
router.get('/workforce-planning/scenarios', requireAuth, getSavedScenarios);

/**
 * GET /api/v1/analytics/workforce-planning/catalog
 * Protected by authenticated session; 7-Scenario Catalog
 */
router.get('/workforce-planning/catalog', requireAuth, getScenarioCatalog);

/**
 * GET /api/v1/analytics/performance-report
 * Protected by authenticated session; Multi-dimensional Performance Analytics & Promotion Readiness
 */
router.get('/performance-report', requireAuth, getPerformanceReport);

export default router;
