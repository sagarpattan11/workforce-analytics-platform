import { apiClient } from '../api/client';

export type WorkforceScenarioType =
  | 'Business Growth'
  | 'High Attrition'
  | 'Department Expansion'
  | 'New Projects'
  | 'Hiring Freeze'
  | 'Skill Shortages'
  | 'Budget Reduction';

export interface IHiringRequirement {
  role: string;
  department: string;
  headcountNeeded: number;
  estimatedCostPerHireINR: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ISkillGapDetail {
  skillName: string;
  currentProficiencyAverage: number;
  requiredProficiencyTarget: number;
  affectedEmployeesCount: number;
}

export interface IInternalTransferRecommendation {
  employeeId: string;
  employeeName: string;
  sourceDepartment: string;
  targetDepartment: string;
  currentRole: string;
  targetRole: string;
  skillMatchScorePercent: number;
}

export interface IUpskillingNeed {
  skillName: string;
  targetDepartment: string;
  recommendedTrainingId?: string;
  trainingName: string;
  employeeCount: number;
  estimatedCostINR: number;
}

export interface IFinancialBudgetImpactINR {
  additionalRecruitmentCostINR: number;
  additionalSalaryCostINR: number;
  trainingAndUpskillingCostINR: number;
  totalBudgetImpactINR: number;
  costSavingsINR: number;
  netFinancialChangeINR: number;
}

export interface ISimulatedImpact {
  currentTotalHeadcount: number;
  projectedRequiredHeadcount: number;
  netHeadcountGap: number;
  hiringRequirements: IHiringRequirement[];
  skillGaps: ISkillGapDetail[];
  internalTransfers: IInternalTransferRecommendation[];
  upskillingNeeds: IUpskillingNeed[];
  financialImpact: IFinancialBudgetImpactINR;
}

export interface IWorkforcePlan {
  _id: string;
  scenarioName: WorkforceScenarioType;
  title: string;
  description: string;
  parameters: {
    growthRatePercent?: number;
    attritionMultiplier?: number;
    targetDepartment?: string;
    newProjectsCount?: number;
    budgetCapINR?: number;
    freezeDurationMonths?: number;
  };
  simulatedImpact: ISimulatedImpact;
  status: 'Draft' | 'Simulated' | 'Approved' | 'Archived';
  createdAt: string;
}

export interface IScenarioCatalogItem {
  name: WorkforceScenarioType;
  label: string;
  description: string;
  defaultParameters: Record<string, any>;
}

export interface IScenarioSimulationInput {
  scenarioName: WorkforceScenarioType;
  title?: string;
  description?: string;
  parameters?: {
    growthRatePercent?: number;
    attritionMultiplier?: number;
    targetDepartment?: string;
    newProjectsCount?: number;
    budgetCapINR?: number;
    freezeDurationMonths?: number;
  };
}

export const planningService = {
  /**
   * GET /api/v1/analytics/workforce-planning/catalog
   * Retrieves Catalog of 7 Supported Business Scenarios
   */
  async getScenarioCatalog(): Promise<IScenarioCatalogItem[]> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: IScenarioCatalogItem[];
    }>('/analytics/workforce-planning/catalog');
    return response.data.data;
  },

  /**
   * POST /api/v1/analytics/workforce-planning/simulate
   * Runs Strategic Workforce Scenario Simulation
   */
  async simulateScenario(input: IScenarioSimulationInput): Promise<IWorkforcePlan> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: IWorkforcePlan;
    }>('/analytics/workforce-planning/simulate', input);
    return response.data.data;
  },

  /**
   * GET /api/v1/analytics/workforce-planning/scenarios
   * Retrieves list of saved / simulated workforce plans
   */
  async getSavedScenarios(): Promise<IWorkforcePlan[]> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: IWorkforcePlan[];
    }>('/analytics/workforce-planning/scenarios');
    return response.data.data;
  },
};

export default planningService;
