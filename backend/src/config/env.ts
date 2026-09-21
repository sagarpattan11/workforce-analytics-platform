import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from project root or current folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  BACKEND_PORT: z.string().transform(Number).optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  // Optional placeholders for later tasks (Task 7 & 9)
  MONGODB_URI: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  JWT_SECRET: z.string().default('wfa-enterprise-jwt-secret-key-2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parsed.data.BACKEND_PORT || parsed.data.PORT,
};