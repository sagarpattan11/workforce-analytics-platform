import { z } from 'zod';

/**
 * Zod Validation Schemas for Team API.
 */

// Schema for creating a new Team (POST /api/v1/teams)
export const createTeamSchema = z.object({
  name: z
    .string({ required_error: 'Team name is required' })
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name cannot exceed 100 characters'),
  code: z
    .string({ required_error: 'Team code is required' })
    .trim()
    .min(2, 'Team code must be at least 2 characters (e.g., FE, BE)')
    .max(10, 'Team code cannot exceed 10 characters')
    .transform((val) => val.toUpperCase()),
  departmentId: z
    .string({ required_error: 'Department ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ObjectId format'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  leadId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead employee ObjectId format')
    .optional()
    .nullable(),
});

// Schema for updating an existing Team (PUT /api/v1/teams/:id)
export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name cannot exceed 100 characters')
    .optional(),
  code: z
    .string()
    .trim()
    .min(2, 'Team code must be at least 2 characters')
    .max(10, 'Team code cannot exceed 10 characters')
    .transform((val) => val.toUpperCase())
    .optional(),
  departmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ObjectId format')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  leadId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead employee ObjectId format')
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

// Inferred TypeScript types from Zod schemas
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
