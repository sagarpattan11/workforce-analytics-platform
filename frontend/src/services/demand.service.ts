import { apiClient } from '../api/client';

export type ShortageSeverity = 'Optimal' | 'Moderate' | 'Severe' | 'Critical';

export interface IDemandSummary {
  totalCurrentHeadcount: number;
  totalProjectedDemand: number;
  totalHeadcountShortage: number;
  totalEstimatedBudgetINR: number;
  criticalShortagesCount: number;
}

export interface IDepartmentDemand {
  departmentId: string;
  departmentName: string;
  currentHeadcount: number;
  projectedDemand: number;
  shortage: number;
}

export interface IRoleDemand {
  roleName: string;
  currentHeadcount: number;
  projectedDemand: number;
  shortage: number;
  severity: ShortageSeverity;
}

export interface IQuarterlyTimeline {
  quarter: string;
  requiredHires: number;
  estimatedBudgetINR: number;
}

export interface ILocationDemand {
  location: string;
  currentCount: number;
  projectedDemand: number;
  shortage: number;
}

export interface IRequiredSkill {
  skillName: string;
  demandFrequency: number;
}

export interface IDemandForecastingData {
  summary: IDemandSummary;
  byDepartment: IDepartmentDemand[];
  byRole: IRoleDemand[];
  quarterlyTimeline: IQuarterlyTimeline[];
  locationDemand: ILocationDemand[];
  topRequiredSkills: IRequiredSkill[];
}

export interface IDemandForecastingResponse {
  success: boolean;
  data: IDemandForecastingData;
  timestamp?: string;
}

class DemandService {
  /**
   * Fetch 12-Month Demand Forecasting Overview Analytics
   */
  public async getDemandForecasting(refresh: boolean = false): Promise<IDemandForecastingResponse> {
    const res = await apiClient.get<IDemandForecastingResponse>('/analytics/demand-forecasting', {
      params: refresh ? { refresh: 'true' } : undefined,
    });
    return res.data;
  }
}

export const demandService = new DemandService();
export default demandService;
