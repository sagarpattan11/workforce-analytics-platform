import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Recruitment Analytics API Integration Tests', () => {
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

  it('1. Returns 401 Unauthorized when request lacks authorization token', async () => {
    const res = await request(app).get('/api/v1/analytics/recruitment');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Returns all Recruitment KPIs with valid metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/recruitment')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { kpis } = res.body.data;
    expect(kpis).toBeDefined();
    expect(kpis.totalRequisitions).toBeGreaterThan(0);
    expect(kpis.openPositions).toBeGreaterThan(0);
    expect(kpis.applications).toBeGreaterThan(0);
    expect(kpis.shortlisted).toBeGreaterThan(0);
    expect(kpis.interviews).toBeGreaterThan(0);
    expect(kpis.offers).toBeGreaterThan(0);
    expect(kpis.successfulHires).toBeGreaterThan(0);
    expect(kpis.timeToHireDays).toBeGreaterThan(0);
    expect(kpis.costPerHire).toBeGreaterThan(0);
    expect(kpis.offerAcceptanceRate).toBeGreaterThan(0);
  });

  it('3. Returns 5-stage Cumulative Funnel and verified stage progression', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/recruitment')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { funnel } = res.body.data;

    expect(Array.isArray(funnel)).toBe(true);
    expect(funnel.length).toBe(5);

    const stageNames = funnel.map((f: any) => f.stage);
    expect(stageNames).toEqual(['Applications', 'Shortlisted', 'Interviewed', 'Offers', 'Hires']);

    // Verify cumulative progression: Applications >= Shortlisted >= Interviewed >= Offers >= Hires
    const counts = funnel.map((f: any) => f.count);
    expect(counts[0]).toBeGreaterThanOrEqual(counts[1]); // Applications >= Shortlisted
    expect(counts[1]).toBeGreaterThanOrEqual(counts[2]); // Shortlisted >= Interviewed
    expect(counts[2]).toBeGreaterThanOrEqual(counts[3]); // Interviewed >= Offers
    expect(counts[3]).toBeGreaterThanOrEqual(counts[4]); // Offers >= Hires
  });

  it('4. Returns Channel, Department, and Priority breakdowns', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/recruitment')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { breakdowns, activeRequisitions } = res.body.data;

    // Sourcing Channels
    expect(Array.isArray(breakdowns.byChannel)).toBe(true);
    expect(breakdowns.byChannel.length).toBeGreaterThan(0);
    const firstChannel = breakdowns.byChannel[0];
    expect(firstChannel.channel).toBeDefined();
    expect(firstChannel.applications).toBeGreaterThanOrEqual(0);
    expect(firstChannel.hires).toBeGreaterThanOrEqual(0);

    // Departments
    expect(Array.isArray(breakdowns.byDepartment)).toBe(true);
    expect(breakdowns.byDepartment.length).toBeGreaterThan(0);

    // Priorities
    expect(Array.isArray(breakdowns.byPriority)).toBe(true);
    expect(breakdowns.byPriority.length).toBeGreaterThan(0);

    // Active Requisitions list
    expect(Array.isArray(activeRequisitions)).toBe(true);
    expect(activeRequisitions.length).toBeGreaterThan(0);
    expect(activeRequisitions[0].requisitionNumber).toBeDefined();
  });

  it('5. Supports filtering by Location (e.g. San Francisco)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/recruitment?location=San+Francisco')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { activeRequisitions } = res.body.data;

    for (const r of activeRequisitions) {
      expect(r.location).toBe('San Francisco');
    }
  });

  it('6. Supports filtering by Sourcing Channel (e.g. LinkedIn)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/recruitment?channel=LinkedIn')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const { activeRequisitions } = res.body.data;

    for (const r of activeRequisitions) {
      expect(r.sourcingChannel).toBe('LinkedIn');
    }
  });
});
