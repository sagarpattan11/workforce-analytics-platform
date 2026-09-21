import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';

describe('Authentication & Role-Based Access Control (RBAC) Tests', () => {
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('POST /api/v1/auth/login - should log in Admin and return JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.role).toBe('Admin');
    adminToken = res.body.data.token;
  });

  it('POST /api/v1/auth/login - should log in Employee and return JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'employee@wfa.internal',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('Employee');
    employeeToken = res.body.data.token;
  });

  it('POST /api/v1/auth/login - should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me - should return authenticated user profile with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@wfa.internal');
    expect(res.body.data.user.role).toBe('Admin');
  });

  it('GET /api/v1/auth/me - should reject request without token with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/admin-only - should ALLOW Admin access (200)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin-only')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Admin access granted');
  });

  it('GET /api/v1/auth/admin-only - should DENY Employee access with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin-only')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Access denied. Role 'Employee' is not authorized");
  });
});
