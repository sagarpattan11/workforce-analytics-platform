import { z } from 'zod';

/**
 * Zod Validation Schemas for Employee API.
 */

// Schema for creating an employee (POST /api/v1/employees)
export const createEmployeeSchema = z.object({
  employeeId: z
    .string({ required_error: 'Employee ID is required' })
    .trim()
    .min(3, 'Employee ID must be at least 3 characters (e.g., EMP-001)')
    .max(20, 'Employee ID cannot exceed 20 characters')
    .transform((val) => val.toUpperCase()),
  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Work email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  phone: z.string().trim().optional(),
  departmentId: z
    .string({ required_error: 'Department ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid department ObjectId format'),
  teamId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ObjectId format')
    .optional()
    .nullable(),
  position: z
    .string({ required_error: 'Position/Title is required' })
    .trim()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position cannot exceed 100 characters'),
  employmentType: z
    .enum(['Full-time', 'Part-time', 'Contract', 'Intern'])
    .default('Full-time'),
  status: z
    .enum(['Active', 'Inactive', 'On Leave', 'Terminated'])
    .default('Active'),
  location: z
    .string({ required_error: 'Location is required' })
    .trim()
    .min(2, 'Location must be at least 2 characters'),
  hireDate: z
    .string({ required_error: 'Hire date is required' })
    .or(z.date())
    .pipe(z.coerce.date()),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience cannot be negative').optional(),
  salary: z.coerce.number().min(0, 'Salary cannot be negative').optional(),
  avatarUrl: z.string().trim().optional(),
});

// Schema for updating an employee (PUT /api/v1/employees/:id)
export const updateEmployeeSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().optional(),
  departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  teamId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
  position: z.string().trim().min(2).max(100).optional(),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']).optional(),
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
  location: z.string().trim().min(2).optional(),
  hireDate: z.string().or(z.date()).pipe(z.coerce.date()).optional(),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience cannot be negative').optional(),
  salary: z.coerce.number().min(0).optional(),
  avatarUrl: z.string().trim().optional(),
});

// Schema for quick status change (PATCH /api/v1/employees/:id/status)
export const updateEmployeeStatusSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated'], {
    required_error: 'Valid status is required',
  }),
});

// Schema for query parameters (GET /api/v1/employees)
export const employeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  search: z.string().trim().optional(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  status: z.string().optional(),
  employmentType: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Inferred TypeScript types
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
