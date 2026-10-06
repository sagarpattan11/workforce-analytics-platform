import { apiClient } from '../api/client';

// ============================================================================
// LEARNING & DEVELOPMENT TYPES & INTERFACES
// ============================================================================

export interface LearningKPIs {
  totalEnrolments: number;
  completedEnrolments: number;
  inProgressEnrolments: number;
  activeEnrolments: number;
  droppedEnrolments: number;
  completionRate: number;
  totalHoursSpent: number;
  uniqueLearners: number;
  avgHoursPerLearner: number;
  avgAssessmentScore: number;
  passedAssessments: number;
  passRate: number;
  certificationsEarned: number;
  avgEffectivenessRating: number;
}

export interface LearningStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface ScoreTierDistribution {
  tier: string;
  count: number;
  fill: string;
}

export interface DepartmentLearningBreakdown {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  totalEnrolments: number;
  completed: number;
  completionRate: number;
  totalHours: number;
  certifications: number;
  avgScore: number;
}

export interface CategoryLearningBreakdown {
  category: string;
  totalEnrolments: number;
  completed: number;
  completionRate: number;
  totalHours: number;
  avgScore: number;
  avgEffectiveness: number;
}

export interface SkillLearningBreakdown {
  skillId: string;
  skill: string;
  category: string;
  enrolments: number;
  completed: number;
  certifications: number;
  avgScore: number;
}

export interface CourseLearningBreakdown {
  trainingId: string;
  title: string;
  category: string;
  provider: string;
  durationHours: number;
  enrolments: number;
  completed: number;
  completionRate: number;
  certifications: number;
  avgScore: number;
  avgRating: number;
}

export interface LearningRecordItem {
  _id: string;
  recordId: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    position?: string;
  } | null;
  trainingId: {
    _id: string;
    title: string;
    category: string;
    provider: string;
    durationHours: number;
  } | null;
  targetSkillId: {
    _id: string;
    name: string;
    category: string;
  } | null;
  departmentId: {
    _id: string;
    name: string;
    code: string;
  } | null;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';
  progressPct: number;
  hoursSpent: number;
  assessmentScore?: number;
  passedAssessment?: boolean;
  certificationEarned?: boolean;
  certificateName?: string;
  certificateId?: string;
  effectivenessRating?: number;
  feedback?: string;
  enrolmentDate: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningAnalyticsData {
  kpis: LearningKPIs;
  statusDistribution: LearningStatusDistribution[];
  scoreDistribution: ScoreTierDistribution[];
  breakdowns: {
    byDepartment: DepartmentLearningBreakdown[];
    byCategory: CategoryLearningBreakdown[];
    bySkill: SkillLearningBreakdown[];
    byCourse: CourseLearningBreakdown[];
  };
  recentRecords: LearningRecordItem[];
}

export interface LearningQueryFilters {
  department?: string;
  departmentId?: string;
  category?: string;
  skill?: string;
  targetSkillId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// LEARNING SERVICE CLIENT
// ============================================================================

export const learningService = {
  /**
   * Retrieves Learning & Development Analytics (KPIs, status, score tiers, breakdowns, directory)
   * GET /api/v1/analytics/learning
   */
  async getLearningAnalytics(
    filters: LearningQueryFilters = {}
  ): Promise<{ success: boolean; message: string; data: LearningAnalyticsData }> {
    const params = new URLSearchParams();

    if (filters.department) params.append('department', filters.department);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.category) params.append('category', filters.category);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.targetSkillId) params.append('targetSkillId', filters.targetSkillId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: LearningAnalyticsData;
    }>(`/analytics/learning${queryString}`);

    return response.data;
  },
};
