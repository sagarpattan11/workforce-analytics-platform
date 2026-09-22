import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/user.model';

describe('Enterprise Passwordless WebAuthn & RBAC Tests', () => {
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    await connectDatabase();
    await User.findOneAndUpdate(
      { email: 'admin@wfa.internal' },
      { $set: { roles: ['admin'], username: 'admin', displayName: 'System Admin' } },
      { upsert: true }
    );
    await User.findOneAndUpdate(
      { email: 'employee@wfa.internal' },
      { $set: { roles: ['employee'], username: 'employee', displayName: 'Alex Employee' } },
      { upsert: true }
    );
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('POST /api/v1/auth/register-challenge - should generate WebAuthn registration options', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register-challenge')
      .send({
        username: 'test.user',
        email: 'test.user@wfa.internal',
        displayName: 'Test User',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.options).toHaveProperty('challenge');
    expect(res.body.options).toHaveProperty('rp');
    expect(res.body.options.rp.name).toBe('Workforce Analytics Platform');
  });

  it('POST /api/v1/auth/login-challenge - should generate WebAuthn authentication options', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login-challenge')
      .send({
        username: 'admin',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.options).toHaveProperty('challenge');
    expect(res.body.options).toHaveProperty('rpId');
  });

  it('POST /api/v1/auth/login - should authenticate Admin and return JWT/session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@wfa.internal',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.roles).toContain('admin');
    adminToken = res.body.token;
  });

  it('POST /api/v1/auth/login - should authenticate Employee and return JWT/session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'employee@wfa.internal',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.roles).toContain('employee');
    employeeToken = res.body.token;
  });

  it('GET /api/v1/auth/me - should return authenticated user profile with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(true);
    expect(res.body.user.email).toBe('admin@wfa.internal');
    expect(res.body.user.roles).toContain('admin');
  });

  it('GET /api/v1/auth/credentials - should return credentials list for user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/credentials')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.credentials)).toBe(true);
  });

  it('GET /api/v1/auth/users - should ALLOW Admin access (200)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('GET /api/v1/auth/users - should DENY Employee access with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/auth/users')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Access denied');
  });

  it('POST /api/v1/auth/logout - should log out user cleanly', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.loggedOut).toBe(true);
  });
});
