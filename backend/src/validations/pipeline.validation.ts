import { z } from 'zod';

export const placementIngestSchema = z.object({
  placementId: z.string().min(1, 'Placement ID is required'),
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateEmail: z.string().email('Valid candidate email is required'),
  employeeId: z.string().optional().nullable(),
  roleTitle: z.string().min(1, 'Role title is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  skills: z.array(z.string()).default([]),
  employer: z.string().min(1, 'Employer is required'),
  location: z.string().min(1, 'Location is required'),
  applicationDate: z.string().or(z.date()),
  placementDate: z.string().or(z.date()).optional().nullable(),
  daysToPlace: z.number().nonnegative().optional(),
  salary: z
    .object({
      baseSalary: z.number().nonnegative(),
      bonus: z.number().nonnegative().default(0),
      currency: z.string().default('INR'),
    })
    .optional(),
  stage: z.enum(['Applied', 'Screened', 'Interviewed', 'Offered', 'Placed', 'Withdrawn', 'Rejected']).default('Applied'),
  status: z.enum(['In Progress', 'Placed', 'Failed']).default('In Progress'),
});

export const recruitmentIngestSchema = z.object({
  requisitionNumber: z.string().min(1, 'Requisition number is required'),
  title: z.string().min(1, 'Job title is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  location: z.string().min(1, 'Location is required'),
  openPositions: z.number().int().positive().default(1),
  filledPositions: z.number().int().nonnegative().default(0),
  applicationsCount: z.number().int().nonnegative().default(0),
  shortlistedCount: z.number().int().nonnegative().default(0),
  interviewedCount: z.number().int().nonnegative().default(0),
  offersCount: z.number().int().nonnegative().default(0),
  hiresCount: z.number().int().nonnegative().default(0),
  timeToHireDays: z.number().nonnegative().default(25),
  costPerHire: z.number().nonnegative().default(4000),
  offerAcceptanceRate: z.number().min(0).max(100).default(80),
  sourcingChannel: z.enum(['LinkedIn', 'Referral', 'Career Portal', 'Campus', 'Agency', 'Direct']).default('LinkedIn'),
  skillsRequired: z.array(z.string()).default([]),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Open', 'Interviewing', 'Offer Sent', 'Closed', 'Cancelled']).default('Open'),
  targetHireDate: z.string().or(z.date()).optional().nullable(),
});

export const learningIngestSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  trainingId: z.string().min(1, 'Training ID is required'),
  targetSkillId: z.string().min(1, 'Target Skill ID is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  status: z.enum(['Enrolled', 'In Progress', 'Completed', 'Dropped']).default('Enrolled'),
  enrolmentDate: z.string().or(z.date()),
  completionDate: z.string().or(z.date()).optional().nullable(),
  progressPct: z.number().min(0).max(100).default(0),
  hoursSpent: z.number().nonnegative().default(0),
  assessmentScore: z.number().min(0).max(100).optional().nullable(),
  passedAssessment: z.boolean().default(false),
  certificationEarned: z.boolean().default(false),
  certificateName: z.string().optional().nullable(),
  certificateId: z.string().optional().nullable(),
  effectivenessRating: z.number().min(1).max(5).optional().nullable(),
  feedback: z.string().optional().nullable(),
});

export const bulkSyncPayloadSchema = z.object({
  placements: z.array(placementIngestSchema).optional(),
  recruitments: z.array(recruitmentIngestSchema).optional(),
  learningRecords: z.array(learningIngestSchema).optional(),
});

export type PlacementIngestInput = z.infer<typeof placementIngestSchema>;
export type RecruitmentIngestInput = z.infer<typeof recruitmentIngestSchema>;
export type LearningIngestInput = z.infer<typeof learningIngestSchema>;
export type BulkSyncPayloadInput = z.infer<typeof bulkSyncPayloadSchema>;
