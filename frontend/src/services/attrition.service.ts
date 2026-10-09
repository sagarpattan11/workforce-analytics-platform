import { apiClient } from '../api/client';

export type RiskCategory = 'Low' | 'Medium' | 'High';
export type ImpactDirection = 'Increases Risk' | 'Decreases Risk' | 'Neutral';

export interface IContributingFactor {
  featureName: string;
  featureKey: string;
  weight: number;
  impactLevel: 'High' | 'Medium' | 'Low';
  direction: ImpactDirection;
  description: string;
}

export interface IModelEvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositives: number;
  falseNegatives: number;
  modelDriftPct: number;
  lastEvaluatedAt: string;
}

export interface IAttritionSummary {
  totalEmployeesEvaluated: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
}

export interface ICategoryDistribution {
  category: RiskCategory;
  count: number;
  percentage: number;
}

export interface IDepartmentRiskComparison {
  departmentId: string;
  departmentName: string;
  avgRiskScore: number;
  highRiskCount: number;
  totalEmployees: number;
}

export interface IRiskTrendPoint {
  month: string;
  avgRiskScore: number;
  highRiskCount: number;
}

export interface IHighRiskEmployee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  riskScore: number;
  riskCategory: RiskCategory;
  recommendedAction: string;
  topFactor: string;
}

export interface IMainContributingFactor {
  factor: string;
  impactCount: number;
  avgWeight: number;
}

export interface IAttritionOverviewResponse {
  success: boolean;
  message: string;
  data: {
    summary: IAttritionSummary;
    categoryDistribution: ICategoryDistribution[];
    departmentComparison: IDepartmentRiskComparison[];
    riskTrend: IRiskTrendPoint[];
    highRiskEmployees: IHighRiskEmployee[];
    mainContributingFactors: IMainContributingFactor[];
  };
}

export interface IExplainabilityResponse {
  success: boolean;
  message: string;
  data: {
    modelVersion: string;
    metrics: IModelEvaluationMetrics;
    featureImportanceRanks: { feature: string; importancePct: number; description: string }[];
    confusionMatrix: {
      truePositives: number;
      falsePositives: number;
      trueNegatives: number;
      falseNegatives: number;
    };
  };
}

export const attritionService = {
  /**
   * GET /api/v1/analytics/attrition
   * Retrieves Attrition Overview Analytics
   */
  async getAttritionOverview(): Promise<IAttritionOverviewResponse> {
    const response = await apiClient.get<IAttritionOverviewResponse>('/analytics/attrition');
    return response.data;
  },

  /**
   * GET /api/v1/analytics/attrition/explainability
   * Retrieves SHAP Explainability & Model Accuracy Metrics
   */
  async getAttritionExplainability(): Promise<IExplainabilityResponse> {
    const response = await apiClient.get<IExplainabilityResponse>(
      '/analytics/attrition/explainability'
    );
    return response.data;
  },

  /**
   * POST /api/v1/analytics/attrition/recalculate
   * Triggers batch recalculation of attrition predictions
   */
  async recalculatePredictions(): Promise<{ success: boolean; message: string; data: { processedCount: number } }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { processedCount: number };
    }>('/analytics/attrition/recalculate');
    return response.data;
  },

  /**
   * GET /api/v1/analytics/attrition/employee/:employeeId
   * Retrieves single employee prediction details
   */
  async getEmployeePrediction(employeeId: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/analytics/attrition/employee/${employeeId}`
    );
    return response.data;
  },
};

export default attritionService;
