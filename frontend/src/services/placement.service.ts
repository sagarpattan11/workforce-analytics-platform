import { apiClient } from '../api/client';

// ============================================================================
// PLACEMENT TYPES & INTERFACES
// ============================================================================

export interface SalaryAnalysis {
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
  currency: string;
}

export interface PlacementKPIs {
  totalCandidates: number;
  candidatesPlaced: number;
  placementRate: number;
  averagePlacementTimeDays: number;
  salaryAnalysis: SalaryAnalysis;
}

export interface FunnelStage {
  stage: string;
  count: number;
  label: string;
}

export interface DepartmentBreakdown {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  total: number;
  placed: number;
  placementRate: number;
  avgSalary: number;
}

export interface EmployerBreakdown {
  employer: string;
  total: number;
  placed: number;
  avgSalary: number;
}

export interface SkillBreakdown {
  skill: string;
  candidateCount: number;
  placedCount: number;
}

export interface LocationBreakdown {
  location: string;
  total: number;
  placed: number;
}

export interface PlacementRecord {
  _id: string;
  placementId: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  } | string;
  skills: string[];
  employer: string;
  location: string;
  applicationDate: string;
  placementDate?: string;
  daysToPlace?: number;
  salary?: {
    baseSalary: number;
    bonus?: number;
    currency: string;
  };
  stage: 'Applied' | 'Screened' | 'Interviewed' | 'Offered' | 'Placed' | 'Withdrawn' | 'Rejected';
  status: 'In Progress' | 'Placed' | 'Failed';
  createdAt?: string;
}

export interface PlacementAnalyticsData {
  kpis: PlacementKPIs;
  funnel: FunnelStage[];
  stageBreakdown: {
    applied: number;
    screened: number;
    interviewed: number;
    offered: number;
    placed: number;
    withdrawn: number;
    rejected: number;
  };
  breakdowns: {
    byDepartment: DepartmentBreakdown[];
    byEmployer: EmployerBreakdown[];
    bySkill: SkillBreakdown[];
    byLocation: LocationBreakdown[];
  };
  recentCandidates: PlacementRecord[];
}

export interface PlacementQueryFilters {
  department?: string;
  departmentId?: string;
  role?: string;
  location?: string;
  skill?: string;
  employer?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// PLACEMENT SERVICE CLIENT
// ============================================================================

export const placementService = {
  /**
   * Retrieves Placement Analytics (KPIs, Funnel, Salary Stats, Segmentations)
   * GET /api/v1/analytics/placement
   */
  async getPlacementAnalytics(
    filters: PlacementQueryFilters = {}
  ): Promise<{ success: boolean; message: string; data: PlacementAnalyticsData }> {
    const params = new URLSearchParams();

    if (filters.department) params.append('department', filters.department);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.role) params.append('role', filters.role);
    if (filters.location) params.append('location', filters.location);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.employer) params.append('employer', filters.employer);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PlacementAnalyticsData;
    }>(`/analytics/placement${queryString}`);

    return response.data;
  },
};
