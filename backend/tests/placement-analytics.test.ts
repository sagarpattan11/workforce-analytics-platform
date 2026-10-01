import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Placement Analytics API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI as string);

    // Login as Admin to obtain JWT auth token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('1. Returns all 5 Placement KPIs with accurate calculations', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/placement')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { kpis } = res.body.data;
    expect(kpis).toBeDefined();
    expect(kpis.totalCandidates).toBeGreaterThan(0);
    expect(kpis.candidatesPlaced).toBeGreaterThan(0);
    expect(kpis.placementRate).toBeGreaterThan(0);
    expect(kpis.averagePlacementTimeDays).toBeGreaterThan(0);

    // Salary Analysis verification
    const { salaryAnalysis } = kpis;
    expect(salaryAnalysis.minSalary).toBeGreaterThan(0);
    expect(salaryAnalysis.maxSalary).toBeGreaterThanOrEqual(salaryAnalysis.minSalary);
    expect(salaryAnalysis.avgSalary).toBeGreaterThan(0);
    expect(salaryAnalysis.medianSalary).toBeGreaterThan(0);
    expect(salaryAnalysis.currency).toBe('USD');
  });

  it('2. Returns 5-stage Placement Funnel and breakdowns', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/placement')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { funnel, breakdowns, recentCandidates } = res.body.data;

    // Funnel stages
    expect(Array.isArray(funnel)).toBe(true);
    expect(funnel.length).toBe(5);
    const stageNames = funnel.map((f: any) => f.stage);
    expect(stageNames).toEqual(['Applied', 'Screened', 'Interviewed', 'Offered', 'Placed']);

    // Breakdowns
    expect(Array.isArray(breakdowns.byDepartment)).toBe(true);
    expect(breakdowns.byDepartment.length).toBeGreaterThan(0);

    expect(Array.isArray(breakdowns.byEmployer)).toBe(true);
    expect(breakdowns.byEmployer.length).toBeGreaterThan(0);

    expect(Array.isArray(breakdowns.bySkill)).toBe(true);
    expect(breakdowns.bySkill.length).toBeGreaterThan(0);

    expect(Array.isArray(breakdowns.byLocation)).toBe(true);
    expect(breakdowns.byLocation.length).toBeGreaterThan(0);

    // Recent candidates list
    expect(Array.isArray(recentCandidates)).toBe(true);
    expect(recentCandidates.length).toBeGreaterThan(0);
  });

  it('3. Supports filtering by Location (e.g. San Francisco)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/placement?location=San+Francisco')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { recentCandidates } = res.body.data;

    for (const c of recentCandidates) {
      expect(c.location).toBe('San Francisco');
    }
  });

  it('4. Supports filtering by Employer (e.g. TechCorp Global)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/placement?employer=TechCorp+Global')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { recentCandidates } = res.body.data;

    for (const c of recentCandidates) {
      expect(c.employer).toBe('TechCorp Global');
    }
  });
});
