import { z } from 'zod';

/**
 * Zod Validation Schemas for Department API.
 * 
 * Why Zod?
 * - Validates request body before reaching database queries.
 * - Prevents malicious, malformed, or missing payloads.
 * - Automatically generates TypeScript types via z.infer.
 */

// Schema for creating a new Department (POST /api/v1/departments)
export const createDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'Department name is required' })
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name cannot exceed 100 characters'),
  code: z
    .string({ required_error: 'Department code is required' })
    .trim()
    .min(2, 'Department code must be at least 2 characters (e.g., ENG, HR)')
    .max(10, 'Department code cannot exceed 10 characters')
    .transform((val) => val.toUpperCase()),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  managerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ObjectId format')
    .optional()
    .nullable(),
});

// Schema for updating an existing Department (PUT /api/v1/departments/:id)
export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(100, 'Department name cannot exceed 100 characters')
    .optional(),
  code: z
    .string()
    .trim()
    .min(2, 'Department code must be at least 2 characters')
    .max(10, 'Department code cannot exceed 10 characters')
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
  managerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid manager ObjectId format')
    .optional()
    .nullable(),
});

// Inferred TypeScript types from Zod schemas
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
