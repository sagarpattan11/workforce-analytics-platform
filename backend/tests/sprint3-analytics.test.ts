import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Sprint 3 - Predictive Workforce Planning & Scenario Analytics APIs', () => {
  let authToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI as string);
    }

    // Authenticate to obtain JWT session token
    const authRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'Password123!',
      });
    if (authRes.body?.token) {
      authToken = authRes.body.token;
    }
  }, 30000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }, 10000);

  it(
    '1. GET /api/v1/analytics/attrition - should return Attrition Overview Analytics',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/attrition')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalEmployeesEvaluated).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.body.data.categoryDistribution)).toBe(true);
      expect(Array.isArray(res.body.data.departmentComparison)).toBe(true);
      expect(Array.isArray(res.body.data.riskTrend)).toBe(true);
    },
    25000
  );

  it(
    '2. GET /api/v1/analytics/attrition/explainability - should return SHAP Explainability & Model Accuracy',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/attrition/explainability')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modelVersion).toBeDefined();
      expect(res.body.data.metrics.accuracy).toBeGreaterThan(80);
      expect(res.body.data.metrics.precision).toBeGreaterThan(80);
      expect(Array.isArray(res.body.data.featureImportanceRanks)).toBe(true);
      expect(res.body.data.confusionMatrix.truePositives).toBeDefined();
    },
    25000
  );

  it(
    '3. POST /api/v1/analytics/attrition/recalculate - should trigger batch calculation',
    async () => {
      const res = await request(app)
        .post('/api/v1/analytics/attrition/recalculate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.processedCount).toBeGreaterThanOrEqual(0);
    },
    25000
  );

  it(
    '4. GET /api/v1/analytics/demand-forecasting - should return Demand Forecasting Analytics',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/demand-forecasting')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalProjectedDemand).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.body.data.byDepartment)).toBe(true);
      expect(Array.isArray(res.body.data.quarterlyTimeline)).toBe(true);
      expect(Array.isArray(res.body.data.locationDemand)).toBe(true);
    },
    25000
  );

  it(
    '5. GET /api/v1/analytics/workforce-planning/catalog - should return 7-Scenario Catalog',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/workforce-planning/catalog')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(7);
    },
    25000
  );

  it(
    '6. POST /api/v1/analytics/workforce-planning/simulate - should simulate Business Growth Scenario',
    async () => {
      const res = await request(app)
        .post('/api/v1/analytics/workforce-planning/simulate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scenarioName: 'Business Growth',
          title: '2026 Expansion Plan',
          description: 'Simulate 25% growth for tech team',
          parameters: { growthRatePercent: 25, targetDepartment: 'Engineering' },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.simulatedImpact.netHeadcountGap).toBeGreaterThan(0);
      expect(res.body.data.simulatedImpact.financialImpact.totalBudgetImpactINR).toBeGreaterThan(0);
    },
    25000
  );

  it(
    '7. GET /api/v1/analytics/workforce-planning/scenarios - should return saved workforce plans',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/workforce-planning/scenarios')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    },
    25000
  );

  it(
    '8. GET /api/v1/analytics/performance-report - should return Performance Trends & Promotion Readiness',
    async () => {
      const res = await request(app)
        .get('/api/v1/analytics/performance-report')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalReviews).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(res.body.data.departmentRatings)).toBe(true);
      expect(Array.isArray(res.body.data.performanceTrends)).toBe(true);
      expect(Array.isArray(res.body.data.promotionReadiness)).toBe(true);
      expect(res.body.data.correlationMatrix).toBeDefined();
    },
    25000
  );
});
