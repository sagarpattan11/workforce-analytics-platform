import { apiClient } from '../api/client';

// ============================================================================
// SKILL DEVELOPMENT & REPORT INTERFACES
// ============================================================================

export interface SkillDevelopmentSummary {
  totalTracked: number;
  completedCount: number;
  passedCount: number;
  certCount: number;
  gapsIdentified: number;
  gapsResolved: number;
  resolutionRate: number;
  avgCompetencyGain: number;
}

export interface SkillDevelopmentRecord {
  _id: string;
  recordId: string;
  employee: {
    _id: string;
    name: string;
    employeeId: string;
    email: string;
    position: string;
  };
  department: {
    _id: string;
    name: string;
    code: string;
  };
  course: {
    _id: string;
    title: string;
    category: string;
    provider: string;
    durationHours: number;
    difficulty: string;
  };
  targetSkill: {
    _id: string;
    name: string;
    category: string;
  };
  progressPct: number;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';
  hoursSpent: number;
  assessmentScore?: number;
  passedAssessment: boolean;
  certificationEarned: boolean;
  certificateName?: string;
  certificateId?: string;
  baselineRating: number;
  postTrainingRating: number;
  ratingDelta: number;
  gapIdentified: boolean;
  gapResolved: boolean;
  enrolmentDate: string;
  completionDate?: string;
}

export interface SkillDevelopmentReportData {
  summary: SkillDevelopmentSummary;
  records: SkillDevelopmentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SkillDevelopmentQueryFilters {
  department?: string;
  departmentId?: string;
  skill?: string;
  status?: string;
  page?: number;
  limit?: number;
  q?: string;
}

export interface ExportReportParams {
  type: 'placement' | 'recruitment' | 'learning' | 'skill-development';
  format: 'csv' | 'excel' | 'pdf';
  department?: string;
  departmentId?: string;
}

// ============================================================================
// REPORT SERVICE CLIENT
// ============================================================================

export const reportService = {
  /**
   * Retrieves Skill Development and Gap Resolution Tracking Report
   * GET /api/v1/reports/skill-development
   */
  async getSkillDevelopmentReport(
    filters: SkillDevelopmentQueryFilters = {}
  ): Promise<{ success: boolean; message: string; data: SkillDevelopmentReportData }> {
    const params = new URLSearchParams();

    if (filters.department) params.append('department', filters.department);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.skill) params.append('skill', filters.skill);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.q) params.append('q', filters.q);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: SkillDevelopmentReportData;
    }>(`/reports/skill-development${queryString}`);

    return response.data;
  },

  /**
   * Downloads Workforce Data in CSV, Excel, or PDF format via Blob streaming
   * GET /api/v1/reports/export
   */
  async downloadReport(params: ExportReportParams): Promise<void> {
    const query = new URLSearchParams();
    query.append('type', params.type);
    query.append('format', params.format);
    if (params.department) query.append('department', params.department);
    if (params.departmentId) query.append('departmentId', params.departmentId);

    const response = await apiClient.get(`/reports/export?${query.toString()}`, {
      responseType: 'blob',
    });

    // Determine extension & MIME
    let extension = 'csv';
    let mimeType = 'text/csv';

    if (params.format === 'excel') {
      extension = 'csv'; // Excel UTF-8 BOM CSV opens directly in MS Excel
      mimeType = 'application/vnd.ms-excel';
    } else if (params.format === 'pdf') {
      extension = 'html';
      mimeType = 'text/html';
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `WFA_${params.type}_Report_${timestamp}.${extension}`;

    // Create browser download link
    const blob = new Blob([response.data], { type: mimeType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);

    // If PDF/HTML format, open in new tab so user can review & print/save as PDF directly
    if (params.format === 'pdf') {
      window.open(downloadUrl, '_blank');
    } else {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    window.URL.revokeObjectURL(downloadUrl);
  },
};
