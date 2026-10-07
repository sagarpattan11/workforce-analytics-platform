import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Sprint 1 - Workforce & Skill Visibility APIs', () => {
  let authToken = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI as string);
    }

    // Authenticate to obtain token for protected endpoints
    const authRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'Password123!',
      });
    if (authRes.body?.token) {
      authToken = authRes.body.token;
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/roles - should retrieve enterprise roles list', async () => {
    const res = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/locations - should retrieve workplace locations list', async () => {
    const res = await request(app)
      .get('/api/v1/locations')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/skills - should retrieve skills registry', async () => {
    const res = await request(app)
      .get('/api/v1/skills')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/skills/analytics - should return full 7-panel skill analytics data', async () => {
    const res = await request(app)
      .get('/api/v1/skills/analytics')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('skillDistribution');
    expect(res.body.data).toHaveProperty('requiredVsAvailable');
    expect(res.body.data).toHaveProperty('skillGaps');
    expect(res.body.data).toHaveProperty('departmentSkillCoverage');
    expect(res.body.data).toHaveProperty('topSkills');
    expect(res.body.data).toHaveProperty('missingSkills');
    expect(res.body.data).toHaveProperty('certificationStatus');
    expect(res.body.data).toHaveProperty('trainingRecommendations');
  });

  it('GET /api/v1/analytics/dashboard - should return exact Sprint 1 KPIs and 6 Charts', async () => {
    const req = request(app).get('/api/v1/analytics/dashboard');
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }
    const res = await req;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // 8 Sprint 1 KPIs
    const kpi = res.body.data.kpi;
    expect(kpi).toHaveProperty('totalEmployees');
    expect(kpi).toHaveProperty('activeEmployees');
    expect(kpi).toHaveProperty('newEmployees');
    expect(kpi).toHaveProperty('employeeExits');
    expect(kpi).toHaveProperty('employeeGrowthRate');
    expect(kpi).toHaveProperty('attritionRate');
    expect(kpi).toHaveProperty('departmentCount');
    expect(kpi).toHaveProperty('locationCount');
    expect(kpi).toHaveProperty('openPositions');

    // 6 Sprint 1 Charts
    const charts = res.body.data.charts;
    expect(charts).toHaveProperty('employeeGrowth');
    expect(charts).toHaveProperty('employeesByDepartment');
    expect(charts).toHaveProperty('roleDistribution');
    expect(charts).toHaveProperty('employeesByLocation');
    expect(charts).toHaveProperty('employeeStatusDistribution');
    expect(charts).toHaveProperty('experienceDistribution');
  });

  it('GET /api/v1/analytics/dashboard with filters - should accept filter parameters', async () => {
    const req = request(app).get('/api/v1/analytics/dashboard?status=Active&location=San+Francisco');
    if (authToken) {
      req.set('Authorization', `Bearer ${authToken}`);
    }
    const res = await req;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpi.totalEmployees).toBeGreaterThanOrEqual(0);
  });
});
