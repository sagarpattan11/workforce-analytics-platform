import { apiClient } from '../api/client';

// ============================================================================
// RECRUITMENT TYPES & INTERFACES
// ============================================================================

export interface RecruitmentKPIs {
  totalRequisitions: number;
  openPositions: number;
  filledPositions: number;
  applications: number;
  shortlisted: number;
  interviews: number;
  offers: number;
  successfulHires: number;
  timeToHireDays: number;
  costPerHire: number;
  offerAcceptanceRate: number;
}

export interface RecruitmentFunnelStage {
  stage: string;
  count: number;
  label: string;
  percentage: number;
}

export interface ChannelBreakdown {
  channel: string;
  applications: number;
  hires: number;
  hireRate: number;
  costPerHire: number;
  timeToHireDays: number;
  requisitionsCount: number;
}

export interface DepartmentRecruitmentBreakdown {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  openPositions: number;
  filledPositions: number;
  applications: number;
  hires: number;
  avgTimeToHire: number;
  avgCost: number;
}

export interface PriorityBreakdown {
  priority: string;
  requisitionsCount: number;
  openPositions: number;
  hires: number;
}

export interface RequisitionRecord {
  _id: string;
  requisitionNumber: string;
  title: string;
  departmentId: {
    _id: string;
    name: string;
    code: string;
  } | string;
  location: string;
  openPositions: number;
  filledPositions: number;
  applicationsCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersCount: number;
  hiresCount: number;
  timeToHireDays: number;
  costPerHire: number;
  offerAcceptanceRate: number;
  sourcingChannel: string;
  skillsRequired: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Interviewing' | 'Offer Sent' | 'Closed' | 'Cancelled';
  createdAt: string;
}

export interface RecruitmentAnalyticsData {
  kpis: RecruitmentKPIs;
  funnel: RecruitmentFunnelStage[];
  breakdowns: {
    byChannel: ChannelBreakdown[];
    byDepartment: DepartmentRecruitmentBreakdown[];
    byPriority: PriorityBreakdown[];
  };
  activeRequisitions: RequisitionRecord[];
}

export interface RecruitmentQueryFilters {
  department?: string;
  departmentId?: string;
  location?: string;
  priority?: string;
  channel?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// RECRUITMENT SERVICE CLIENT
// ============================================================================

export const recruitmentService = {
  /**
   * Retrieves Recruitment Analytics (KPIs, Funnel, Channel Efficiency, Requisitions)
   * GET /api/v1/analytics/recruitment
   */
  async getRecruitmentAnalytics(
    filters: RecruitmentQueryFilters = {}
  ): Promise<{ success: boolean; message: string; data: RecruitmentAnalyticsData }> {
    const params = new URLSearchParams();

    if (filters.department) params.append('department', filters.department);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.location) params.append('location', filters.location);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.channel) params.append('channel', filters.channel);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: RecruitmentAnalyticsData;
    }>(`/analytics/recruitment${queryString}`);

    return response.data;
  },
};
