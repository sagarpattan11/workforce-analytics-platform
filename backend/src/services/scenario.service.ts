import mongoose from 'mongoose';
import WorkforcePlan, {
  IWorkforcePlan,
  WorkforceScenarioType,
  IHiringRequirement,
  ISkillGapDetail,
  IInternalTransferRecommendation,
  IUpskillingNeed,
  IFinancialBudgetImpactINR,
} from '../models/workforce-plan.model';
import Employee from '../models/employee.model';
import Department from '../models/department.model';
import { Training } from '../models/training.model';

export interface IScenarioSimulationInput {
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
}

export class ScenarioService {
  /**
   * Run Strategic Workforce Scenario Simulation
   */
  public async simulateWorkforceScenario(
    input: IScenarioSimulationInput,
    userId: string
  ): Promise<IWorkforcePlan> {
    // 1. Fetch current total active headcount
    const activeEmployees = await Employee.find({ isDeleted: false, status: 'Active' })
      .populate('departmentId')
      .populate('roleId');

    const currentTotalHeadcount = activeEmployees.length || 120;

    // 2. Extract input parameters
    const growthRate = input.parameters?.growthRatePercent || 15;
    const attritionMult = input.parameters?.attritionMultiplier || 1.2;
    const targetDeptName = input.parameters?.targetDepartment || 'Engineering';
    const newProjects = input.parameters?.newProjectsCount || 3;
    const budgetCap = input.parameters?.budgetCapINR || 5000000; // ₹50 Lakhs

    let projectedRequiredHeadcount = currentTotalHeadcount;
    let netHeadcountGap = 0;

    const hiringRequirements: IHiringRequirement[] = [];
    const skillGaps: ISkillGapDetail[] = [];
    const internalTransfers: IInternalTransferRecommendation[] = [];
    const upskillingNeeds: IUpskillingNeed[] = [];

    // 3. Scenario-Specific Simulation Logic
    switch (input.scenarioName) {
      case 'Business Growth': {
        const growthCount = Math.ceil(currentTotalHeadcount * (growthRate / 100));
        projectedRequiredHeadcount = currentTotalHeadcount + growthCount;
        netHeadcountGap = growthCount;

        hiringRequirements.push(
          {
            role: 'Senior Full Stack Engineer',
            department: 'Engineering',
            headcountNeeded: Math.ceil(growthCount * 0.4),
            estimatedCostPerHireINR: 150000,
            priority: 'High',
          },
          {
            role: 'DevOps Specialist',
            department: 'Engineering',
            headcountNeeded: Math.ceil(growthCount * 0.2),
            estimatedCostPerHireINR: 180000,
            priority: 'Critical',
          },
          {
            role: 'Product Manager',
            department: 'Product',
            headcountNeeded: Math.max(1, Math.ceil(growthCount * 0.15)),
            estimatedCostPerHireINR: 200000,
            priority: 'Medium',
          }
        );
        break;
      }

      case 'High Attrition': {
        const turnoverCount = Math.ceil(currentTotalHeadcount * 0.18 * attritionMult);
        projectedRequiredHeadcount = currentTotalHeadcount;
        netHeadcountGap = turnoverCount;

        hiringRequirements.push(
          {
            role: 'Replacement Software Engineer',
            department: 'Engineering',
            headcountNeeded: Math.ceil(turnoverCount * 0.5),
            estimatedCostPerHireINR: 140000,
            priority: 'Critical',
          },
          {
            role: 'Replacement Data Analyst',
            department: 'Analytics',
            headcountNeeded: Math.ceil(turnoverCount * 0.3),
            estimatedCostPerHireINR: 120000,
            priority: 'High',
          }
        );
        break;
      }

      case 'Department Expansion': {
        const expHeadcount = Math.ceil(currentTotalHeadcount * 0.22);
        projectedRequiredHeadcount = currentTotalHeadcount + expHeadcount;
        netHeadcountGap = expHeadcount;

        hiringRequirements.push({
          role: 'Expansion Specialist',
          department: targetDeptName,
          headcountNeeded: expHeadcount,
          estimatedCostPerHireINR: 160000,
          priority: 'Critical',
        });
        break;
      }

      case 'New Projects': {
        const projectHeadcount = newProjects * 4;
        projectedRequiredHeadcount = currentTotalHeadcount + projectHeadcount;
        netHeadcountGap = projectHeadcount;

        skillGaps.push({
          skillName: 'Cloud Architecture & Kubernetes',
          currentProficiencyAverage: 4.2,
          requiredProficiencyTarget: 8.5,
          affectedEmployeesCount: 15,
        });

        hiringRequirements.push({
          role: 'Lead Cloud Architect',
          department: 'Engineering',
          headcountNeeded: newProjects,
          estimatedCostPerHireINR: 220000,
          priority: 'Critical',
        });
        break;
      }

      case 'Hiring Freeze': {
        projectedRequiredHeadcount = currentTotalHeadcount;
        netHeadcountGap = Math.ceil(currentTotalHeadcount * 0.08); // 8% natural attrition gap

        // Maximize internal transfers
        for (let i = 0; i < Math.min(3, activeEmployees.length); i++) {
          const emp = activeEmployees[i];
          internalTransfers.push({
            employeeId: emp._id as mongoose.Types.ObjectId,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            sourceDepartment: 'Operations',
            targetDepartment: 'Engineering',
            currentRole: emp.position || 'Specialist',
            targetRole: 'Junior Developer',
            skillMatchScorePercent: 82.5,
          });
        }
        break;
      }

      case 'Skill Shortages': {
        projectedRequiredHeadcount = currentTotalHeadcount;
        netHeadcountGap = 0;

        skillGaps.push(
          {
            skillName: 'AI / LLM Integration',
            currentProficiencyAverage: 3.0,
            requiredProficiencyTarget: 8.0,
            affectedEmployeesCount: 18,
          },
          {
            skillName: 'Cybersecurity Compliance',
            currentProficiencyAverage: 5.0,
            requiredProficiencyTarget: 8.5,
            affectedEmployeesCount: 12,
          }
        );

        upskillingNeeds.push({
          skillName: 'Enterprise AI & Machine Learning',
          targetDepartment: 'Engineering',
          trainingName: 'Advanced Applied AI & ML Masterclass',
          employeeCount: 18,
          estimatedCostINR: 250000,
        });
        break;
      }

      case 'Budget Reduction': {
        const savingsTarget = Math.ceil(currentTotalHeadcount * 0.05);
        projectedRequiredHeadcount = currentTotalHeadcount - savingsTarget;
        netHeadcountGap = -savingsTarget;
        break;
      }

      default: {
        netHeadcountGap = 5;
        projectedRequiredHeadcount = currentTotalHeadcount + 5;
      }
    }

    // 4. Default Training Linkage if upskillingNeeds empty
    if (upskillingNeeds.length === 0) {
      const activeTraining = await Training.findOne({ isActive: true });
      upskillingNeeds.push({
        skillName: 'Full Stack Modernization',
        targetDepartment: targetDeptName,
        recommendedTrainingId: activeTraining?._id as mongoose.Types.ObjectId,
        trainingName: activeTraining?.title || 'Full Stack Engineering Upskilling',
        employeeCount: 10,
        estimatedCostINR: 150000,
      });
    }

    // 5. Calculate Financial Budget Impact in ₹ INR
    const recruitmentCostINR = hiringRequirements.reduce(
      (sum, h) => sum + h.headcountNeeded * h.estimatedCostPerHireINR,
      0
    );
    const salaryCostINR = netHeadcountGap > 0 ? netHeadcountGap * 600000 : 0; // ₹6,00,000 avg annual salary
    const upskillingCostINR = upskillingNeeds.reduce((sum, u) => sum + u.estimatedCostINR, 0);
    const costSavingsINR = netHeadcountGap < 0 ? Math.abs(netHeadcountGap) * 700000 : 0;

    const totalBudgetImpactINR = recruitmentCostINR + salaryCostINR + upskillingCostINR;
    const netFinancialChangeINR = totalBudgetImpactINR - costSavingsINR;

    const financialImpact: IFinancialBudgetImpactINR = {
      additionalRecruitmentCostINR: recruitmentCostINR,
      additionalSalaryCostINR: salaryCostINR,
      trainingAndUpskillingCostINR: upskillingCostINR,
      totalBudgetImpactINR,
      costSavingsINR,
      netFinancialChangeINR,
    };

    // 6. Save Simulated Scenario Plan to MongoDB
    const planDoc = await WorkforcePlan.create({
      scenarioName: input.scenarioName,
      title: input.title,
      description: input.description,
      parameters: input.parameters,
      simulatedImpact: {
        currentTotalHeadcount,
        projectedRequiredHeadcount,
        netHeadcountGap,
        hiringRequirements,
        skillGaps,
        internalTransfers,
        upskillingNeeds,
        financialImpact,
      },
      status: 'Simulated',
      createdBy: new mongoose.Types.ObjectId(
        mongoose.Types.ObjectId.isValid(userId) ? userId : '60d0fe4f5311236168a109ca'
      ),
    });

    return planDoc;
  }

  /**
   * Get list of saved / simulated scenario plans
   */
  public async getSavedScenarios(): Promise<IWorkforcePlan[]> {
    const scenarios = await WorkforcePlan.find()
      .populate('createdBy', 'username email role')
      .sort({ createdAt: -1 });

    if (scenarios.length === 0) {
      // Auto-run a default simulation to ensure data availability
      await this.simulateWorkforceScenario(
        {
          scenarioName: 'Business Growth',
          title: 'Q3 Enterprise Expansion Scenario',
          description: 'Simulating 20% headcount growth for Engineering and Product teams.',
          parameters: { growthRatePercent: 20, targetDepartment: 'Engineering' },
        },
        '60d0fe4f5311236168a109ca'
      );
      return WorkforcePlan.find().sort({ createdAt: -1 });
    }

    return scenarios;
  }

  /**
   * Return catalog of 7 Supported Business Scenarios with default configs
   */
  public getAvailableScenarioTypes(): {
    name: WorkforceScenarioType;
    label: string;
    description: string;
    defaultParameters: Record<string, any>;
  }[] {
    return [
      {
        name: 'Business Growth',
        label: 'Business Growth & Headcount Scaling',
        description: 'Simulate company expansion targets and compute hiring requirements.',
        defaultParameters: { growthRatePercent: 15 },
      },
      {
        name: 'High Attrition',
        label: 'High Attrition & Retention Crisis',
        description: 'Simulate turnover spikes and generate emergency backfill hiring plans.',
        defaultParameters: { attritionMultiplier: 1.5 },
      },
      {
        name: 'Department Expansion',
        label: 'Department Expansion',
        description: 'Scale a target department aggressively and model team budget in ₹ INR.',
        defaultParameters: { targetDepartment: 'Engineering', growthRatePercent: 25 },
      },
      {
        name: 'New Projects',
        label: 'New Client Projects Launch',
        description: 'Model specialized team needs and skill gaps for upcoming projects.',
        defaultParameters: { newProjectsCount: 4 },
      },
      {
        name: 'Hiring Freeze',
        label: 'Hiring Freeze & Internal Talent Redeployment',
        description: 'Freeze external hires and optimize internal cross-department transfers.',
        defaultParameters: { freezeDurationMonths: 6 },
      },
      {
        name: 'Skill Shortages',
        label: 'Technical Skill Shortages & Upskilling',
        description: 'Identify technical skill gaps and link them to corporate training courses.',
        defaultParameters: {},
      },
      {
        name: 'Budget Reduction',
        label: 'Budget Reduction & Cost Optimization',
        description: 'Optimize headcount under strict financial budget caps in ₹ INR.',
        defaultParameters: { budgetCapINR: 5000000 },
      },
    ];
  }
}

export default new ScenarioService();
