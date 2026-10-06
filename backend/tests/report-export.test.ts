import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Reports & Multi-Format Export Engine Integration Tests', () => {
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

  it('1. Returns 401 Unauthorized when accessing reports without authentication', async () => {
    const resDev = await request(app).get('/api/v1/reports/skill-development');
    expect(resDev.status).toBe(401);

    const resExport = await request(app).get('/api/v1/reports/export?type=placement&format=csv');
    expect(resExport.status).toBe(401);
  });

  it('2. Returns Skill Development Report with summary metrics and records', async () => {
    const res = await request(app)
      .get('/api/v1/reports/skill-development')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, records, pagination } = res.body.data;
    expect(summary).toBeDefined();
    expect(summary.totalTracked).toBeGreaterThan(0);
    expect(summary.completedCount).toBeGreaterThan(0);
    expect(summary.gapsIdentified).toBeGreaterThan(0);
    expect(summary.gapsResolved).toBeGreaterThan(0);
    expect(summary.resolutionRate).toBeGreaterThan(0);
    expect(summary.avgCompetencyGain).toBeGreaterThan(0);

    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);

    const rec = records[0];
    expect(rec.employee).toBeDefined();
    expect(rec.course).toBeDefined();
    expect(rec.targetSkill).toBeDefined();
    expect(rec.baselineRating).toBeGreaterThanOrEqual(1);
    expect(rec.postTrainingRating).toBeGreaterThanOrEqual(rec.baselineRating);
    expect(rec.gapIdentified).toBeDefined();
    expect(rec.gapResolved).toBeDefined();

    expect(pagination).toBeDefined();
    expect(pagination.total).toBeGreaterThan(0);
  });

  it('3. Streams CSV report with RFC-4180 headers for Skill Development', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?type=skill-development&format=csv')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain('.csv');

    const csvText = res.text;
    expect(csvText).toContain('Record ID');
    expect(csvText).toContain('Employee Name');
    expect(csvText).toContain('Skill Gap Resolved');
  });

  it('4. Streams Excel report with UTF-8 BOM encoding for special characters', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?type=placement&format=excel')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/vnd.ms-excel');
    expect(res.headers['content-disposition']).toContain('attachment');

    // Excel BOM (\uFEFF) verification
    expect(res.text.charCodeAt(0)).toBe(0xfeff);
    expect(res.text).toContain('Candidate Name');
    expect(res.text).toContain('Offered Base Salary (INR)');
  });

  it('5. Generates printable executive summary for PDF output format', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?type=recruitment&format=pdf')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Workforce Analytics Platform');
    expect(res.text).toContain('Official Workforce Report');
    expect(res.text).toContain('Requisition #');
  });

  it('6. Exports Learning analytics report properly', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?type=learning&format=csv')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Course Title');
    expect(res.text).toContain('Assessment Score (%)');
  });

  it('7. Returns 400 Bad Request on unsupported export format', async () => {
    const res = await request(app)
      .get('/api/v1/reports/export?type=placement&format=xml')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unsupported export format');
  });
});
