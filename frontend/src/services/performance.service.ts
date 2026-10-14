import { apiClient } from '../api/client';

export interface IPerformanceSummary {
  totalReviews: number;
  avgRating: number;
  avgGoalAchievement: number;
  topPerformersCount: number;
  promotionReadyCount: number;
}

export interface IDepartmentRating {
  departmentId: string;
  departmentName: string;
  avgRating: number;
  avgGoalAchievement: number;
  reviewCount: number;
}

export interface IPerformanceTrend {
  reviewPeriod: string;
  avgRating: number;
  reviewsCount: number;
}

export interface IPromotionReadyEmployee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  rating: number;
  goalsAchievedRate: number;
  tenureMonths: number;
  promotionReadinessScore: number;
  recommendedRole: string;
}

export interface ICorrelationAttendance {
  attendanceBand: string;
  avgPerformanceRating: number;
  employeeCount: number;
}

export interface ICorrelationTraining {
  trainingBand: string;
  avgPerformanceRating: number;
  employeeCount: number;
}

export interface ICorrelationMatrix {
  performanceVsAttendance: ICorrelationAttendance[];
  performanceVsTrainingHours: ICorrelationTraining[];
}

export interface IPerformanceReportData {
  summary: IPerformanceSummary;
  departmentRatings: IDepartmentRating[];
  allDepartments?: Array<{ departmentId: string; departmentName: string; code: string }>;
  performanceTrends: IPerformanceTrend[];
  promotionReadiness: IPromotionReadyEmployee[];
  correlationMatrix: ICorrelationMatrix;
}

export interface IPerformanceReportResponse {
  success: boolean;
  message: string;
  data: IPerformanceReportData;
}

export interface IPerformanceFilterParams {
  departmentId?: string;
  reviewPeriod?: string;
}

export const performanceService = {
  /**
   * GET /api/v1/analytics/performance-report
   * Retrieves performance analytics, trends, correlations, and promotion readiness candidates
   */
  async getPerformanceReport(params?: IPerformanceFilterParams): Promise<IPerformanceReportResponse> {
    const response = await apiClient.get<IPerformanceReportResponse>('/analytics/performance-report', {
      params,
    });
    return response.data;
  },
};

export default performanceService;
