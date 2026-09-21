import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('GET /api/v1/health', () => {
  it('should return 200 and healthy status', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      status: 'healthy',
      service: 'WFA API',
    });
  });

  it('GET /api-docs - should serve Swagger UI HTML', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
    expect(response.text).toContain('WFA Platform - API Documentation');
  });

  it('GET /api-docs.json - should serve OpenAPI 3.0 specification', async () => {
    const response = await request(app).get('/api-docs.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('Workforce Analytics Platform API');
    expect(response.body.paths).toHaveProperty('/auth/login');
  });
});
