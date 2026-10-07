import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Learning & Development Analytics API Integration Tests', () => {
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
    const res = await request(app).get('/api/v1/analytics/learning');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Returns all Learning & Development KPIs with valid metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { kpis } = res.body.data;
    expect(kpis).toBeDefined();
    expect(kpis.totalEnrolments).toBeGreaterThan(0);
    expect(kpis.completedEnrolments).toBeGreaterThan(0);
    expect(kpis.completionRate).toBeGreaterThan(0);
    expect(kpis.totalHoursSpent).toBeGreaterThan(0);
    expect(kpis.uniqueLearners).toBeGreaterThan(0);
    expect(kpis.avgHoursPerLearner).toBeGreaterThan(0);
    expect(kpis.avgAssessmentScore).toBeGreaterThan(0);
    expect(kpis.passedAssessments).toBeGreaterThan(0);
    expect(kpis.passRate).toBeGreaterThan(0);
    expect(kpis.certificationsEarned).toBeGreaterThan(0);
    expect(kpis.avgEffectivenessRating).toBeGreaterThan(0);
  });

  it('3. Returns 4-bucket Status Distribution with counts and percentages', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { statusDistribution } = res.body.data;

    expect(Array.isArray(statusDistribution)).toBe(true);
    expect(statusDistribution.length).toBe(4);

    const statuses = statusDistribution.map((s: any) => s.status);
    expect(statuses).toContain('Enrolled');
    expect(statuses).toContain('In Progress');
    expect(statuses).toContain('Completed');
    expect(statuses).toContain('Dropped');

    const totalCount = statusDistribution.reduce((acc: number, curr: any) => acc + curr.count, 0);
    expect(totalCount).toBe(res.body.data.kpis.totalEnrolments);
  });

  it('4. Returns Assessment Score Tier distribution', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { scoreDistribution } = res.body.data;

    expect(Array.isArray(scoreDistribution)).toBe(true);
    expect(scoreDistribution.length).toBe(4);

    const tiers = scoreDistribution.map((t: any) => t.tier);
    expect(tiers[0]).toContain('< 60%');
    expect(tiers[1]).toContain('60% - 74%');
    expect(tiers[2]).toContain('75% - 89%');
    expect(tiers[3]).toContain('90% - 100%');
  });

  it('5. Returns Segmented Breakdowns: Departments, Categories, Skills, and Courses', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { breakdowns } = res.body.data;
    expect(breakdowns).toBeDefined();

    // Department breakdown
    expect(Array.isArray(breakdowns.byDepartment)).toBe(true);
    expect(breakdowns.byDepartment.length).toBeGreaterThan(0);
    const dept = breakdowns.byDepartment[0];
    expect(dept.departmentName).toBeDefined();
    expect(dept.totalEnrolments).toBeGreaterThan(0);
    expect(dept.completionRate).toBeDefined();

    // Category breakdown
    expect(Array.isArray(breakdowns.byCategory)).toBe(true);
    expect(breakdowns.byCategory.length).toBeGreaterThan(0);
    const cat = breakdowns.byCategory[0];
    expect(cat.category).toBeDefined();
    expect(cat.totalEnrolments).toBeGreaterThan(0);

    // Skill breakdown
    expect(Array.isArray(breakdowns.bySkill)).toBe(true);
    expect(breakdowns.bySkill.length).toBeGreaterThan(0);
    const skl = breakdowns.bySkill[0];
    expect(skl.skill).toBeDefined();
    expect(skl.enrolments).toBeGreaterThan(0);

    // Course breakdown
    expect(Array.isArray(breakdowns.byCourse)).toBe(true);
    expect(breakdowns.byCourse.length).toBeGreaterThan(0);
    const crs = breakdowns.byCourse[0];
    expect(crs.title).toBeDefined();
    expect(crs.enrolments).toBeGreaterThan(0);
  });

  it('6. Supports Department filtering correctly', async () => {
    const allRes = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    const filteredRes = await request(app)
      .get('/api/v1/analytics/learning?department=ENG')
      .set('Authorization', `Bearer ${authToken}`);

    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.success).toBe(true);

    const allTotal = allRes.body.data.kpis.totalEnrolments;
    const filteredTotal = filteredRes.body.data.kpis.totalEnrolments;

    expect(filteredTotal).toBeLessThanOrEqual(allTotal);
    expect(filteredTotal).toBeGreaterThan(0);
  });

  it('7. Returns Recent Learning Records directory populated with references', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/learning')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const { recentRecords } = res.body.data;

    expect(Array.isArray(recentRecords)).toBe(true);
    expect(recentRecords.length).toBeGreaterThan(0);

    const record = recentRecords[0];
    expect(record.recordId).toBeDefined();
    expect(record.status).toBeDefined();
    expect(record.progressPct).toBeDefined();
    expect(record.hoursSpent).toBeDefined();

    // Check populated references
    if (record.employeeId) {
      expect(record.employeeId.firstName).toBeDefined();
      expect(record.employeeId.email).toBeDefined();
    }
    if (record.trainingId) {
      expect(record.trainingId.title).toBeDefined();
      expect(record.trainingId.category).toBeDefined();
    }
  });
});
