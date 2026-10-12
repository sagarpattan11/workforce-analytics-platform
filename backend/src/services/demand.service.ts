import mongoose from 'mongoose';
import Department from '../models/department.model';
import Employee from '../models/employee.model';
import { Role } from '../models/role.model';
import { Location } from '../models/location.model';
import {
  DemandForecast,
  IDemandForecast,
  IQuarterlyDemand,
  ILocationDemand,
} from '../models/demand-forecast.model';

export class DemandService {
  /**
   * Calculate or update Demand Forecasts for all active departments and roles
   */
  public async batchCalculateDemandForecasts(): Promise<{ processedCount: number }> {
    // 1. Fetch departments lookup map
    const departments = await Department.find();
    const deptLookup = new Map<string, string>();
    departments.forEach((d) => deptLookup.set(d._id.toString(), d.name));

    // 2. Fetch all current workforce employees (non-deleted)
    const employees = await Employee.find({ isDeleted: false });

    // Fallback seed if employees collection is empty
    if (employees.length === 0) {
      await DemandForecast.deleteMany({});
      const seedDefaults = [
        {
          departmentName: 'Engineering',
          roleName: 'Senior Full-Stack Engineer',
          roleCode: 'SFE',
          currentHeadcount: 14,
          projectedDemand: 20,
          headcountShortage: 6,
          shortageSeverity: 'Critical' as const,
          requiredSkills: ['TypeScript', 'React', 'Node.js', 'System Design'],
        },
        {
          departmentName: 'Engineering',
          roleName: 'Cloud DevOps Architect',
          roleCode: 'CDA',
          currentHeadcount: 6,
          projectedDemand: 10,
          headcountShortage: 4,
          shortageSeverity: 'Severe' as const,
          requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines'],
        },
        {
          departmentName: 'Product & Design',
          roleName: 'Lead Product Manager',
          roleCode: 'LPM',
          currentHeadcount: 5,
          projectedDemand: 8,
          headcountShortage: 3,
          shortageSeverity: 'Moderate' as const,
          requiredSkills: ['Product Strategy', 'Agile/Scrum', 'Data Analytics', 'Roadmapping'],
        },
        {
          departmentName: 'Data & AI',
          roleName: 'Machine Learning Engineer',
          roleCode: 'MLE',
          currentHeadcount: 4,
          projectedDemand: 7,
          headcountShortage: 3,
          shortageSeverity: 'Moderate' as const,
          requiredSkills: ['Python', 'PyTorch', 'Model Deployment', 'NLP'],
        },
        {
          departmentName: 'Sales & Growth',
          roleName: 'Enterprise Account Executive',
          roleCode: 'EAE',
          currentHeadcount: 10,
          projectedDemand: 15,
          headcountShortage: 5,
          shortageSeverity: 'Severe' as const,
          requiredSkills: ['B2B Sales', 'Contract Negotiation', 'CRM', 'Pipeline Management'],
        },
        {
          departmentName: 'Operations & HR',
          roleName: 'Talent Acquisition Partner',
          roleCode: 'TAP',
          currentHeadcount: 4,
          projectedDemand: 6,
          headcountShortage: 2,
          shortageSeverity: 'Moderate' as const,
          requiredSkills: ['Technical Sourcing', 'ATS', 'Talent Screening', 'Onboarding'],
        },
      ];

      for (const item of seedDefaults) {
        const dummyDeptId = new mongoose.Types.ObjectId();
        const totalBudget = item.headcountShortage * 120000;
        await DemandForecast.create({
          departmentId: dummyDeptId,
          departmentName: item.departmentName,
          roleName: item.roleName,
          roleCode: item.roleCode,
          currentHeadcount: item.currentHeadcount,
          projectedDemand: item.projectedDemand,
          headcountShortage: item.headcountShortage,
          shortageSeverity: item.shortageSeverity,
          forecastHorizon: '12 Months',
          confidenceScore: 91.2,
          requiredSkills: item.requiredSkills,
          quarterlyDemand: [
            { quarter: 'Q1 2026', requiredHires: Math.ceil(item.headcountShortage * 0.35), estimatedBudgetINR: Math.round(totalBudget * 0.35), priority: 'Critical' },
            { quarter: 'Q2 2026', requiredHires: Math.ceil(item.headcountShortage * 0.3), estimatedBudgetINR: Math.round(totalBudget * 0.3), priority: 'High' },
            { quarter: 'Q3 2026', requiredHires: Math.ceil(item.headcountShortage * 0.2), estimatedBudgetINR: Math.round(totalBudget * 0.2), priority: 'Medium' },
            { quarter: 'Q4 2026', requiredHires: Math.max(0, item.headcountShortage - Math.ceil(item.headcountShortage * 0.85)), estimatedBudgetINR: Math.round(totalBudget * 0.15), priority: 'Low' },
          ],
          locationDemand: [
            { location: 'Bangalore', currentCount: Math.ceil(item.currentHeadcount * 0.5), projectedDemand: Math.ceil(item.projectedDemand * 0.5), shortage: Math.ceil(item.headcountShortage * 0.5) },
            { location: 'Mumbai', currentCount: Math.ceil(item.currentHeadcount * 0.3), projectedDemand: Math.ceil(item.projectedDemand * 0.3), shortage: Math.ceil(item.headcountShortage * 0.3) },
            { location: 'San Francisco', currentCount: Math.max(0, item.currentHeadcount - Math.ceil(item.currentHeadcount * 0.8)), projectedDemand: Math.max(0, item.projectedDemand - Math.ceil(item.projectedDemand * 0.8)), shortage: Math.max(0, item.headcountShortage - Math.ceil(item.headcountShortage * 0.8)) },
          ],
          lastCalculatedAt: new Date(),
        });
      }
      return { processedCount: seedDefaults.length };
    }

    // 3. Clear existing forecasts to remove previous duplicate counts
    await DemandForecast.deleteMany({});

    // 4. Group actual active employees by department and position
    const roleMap: Record<
      string,
      {
        deptId: mongoose.Types.ObjectId;
        deptName: string;
        roleName: string;
        currentCount: number;
        locations: string[];
      }
    > = {};

    for (const emp of employees) {
      const deptIdStr = emp.departmentId ? emp.departmentId.toString() : '';
      const deptName = deptLookup.get(deptIdStr) || 'General Operations';
      const roleName = emp.position || 'Specialist';
      const key = `${deptIdStr}:::${roleName}`;

      if (!roleMap[key]) {
        roleMap[key] = {
          deptId: emp.departmentId,
          deptName,
          roleName,
          currentCount: 0,
          locations: [],
        };
      }
      roleMap[key].currentCount += 1;
      if (emp.location) {
        roleMap[key].locations.push(emp.location);
      }
    }

    let totalCount = 0;
    const roleEntries = Object.values(roleMap);

    for (const item of roleEntries) {
      const currentCount = item.currentCount;
      const projectedGrowth = Math.max(1, Math.ceil(currentCount * 0.4));
      const projectedDemand = currentCount + projectedGrowth;
      const headcountShortage = projectedDemand - currentCount;

      let shortageSeverity: 'Optimal' | 'Moderate' | 'Severe' | 'Critical' = 'Optimal';
      if (headcountShortage >= 3) shortageSeverity = 'Critical';
      else if (headcountShortage === 2) shortageSeverity = 'Severe';
      else if (headcountShortage === 1) shortageSeverity = 'Moderate';

      const totalBudgetNeeded = headcountShortage * 120000; // ₹1,20,000 avg cost per hire in INR

      const q1Hires = Math.ceil(headcountShortage * 0.4);
      const q2Hires = Math.ceil(headcountShortage * 0.3);
      const q3Hires = Math.ceil(headcountShortage * 0.2);
      const q4Hires = Math.max(0, headcountShortage - (q1Hires + q2Hires + q3Hires));

      const quarterlyDemand: IQuarterlyDemand[] = [
        {
          quarter: 'Q1 2026',
          requiredHires: q1Hires,
          estimatedBudgetINR: q1Hires * 120000,
          priority: shortageSeverity === 'Critical' ? 'Critical' : 'High',
        },
        {
          quarter: 'Q2 2026',
          requiredHires: q2Hires,
          estimatedBudgetINR: q2Hires * 120000,
          priority: 'High',
        },
        {
          quarter: 'Q3 2026',
          requiredHires: q3Hires,
          estimatedBudgetINR: q3Hires * 120000,
          priority: 'Medium',
        },
        {
          quarter: 'Q4 2026',
          requiredHires: q4Hires,
          estimatedBudgetINR: q4Hires * 120000,
          priority: 'Low',
        },
      ];

      // Normalize employee locations to official operating hubs
      const normalizeLocation = (loc?: string): string => {
        if (!loc) return 'San Francisco';
        const l = loc.trim().toLowerCase();
        if (l.includes('francisco') || l.includes('sf')) return 'San Francisco';
        if (l.includes('york') || l.includes('ny')) return 'New York';
        if (l.includes('london')) return 'London';
        if (l.includes('bengaluru') || l.includes('bangalore')) return 'Bengaluru';
        if (l.includes('berlin')) return 'Berlin';
        return 'Remote';
      };

      // Count locations for this specific role
      const roleLocCounts: Record<string, number> = {};
      item.locations.forEach((loc) => {
        const hub = normalizeLocation(loc);
        roleLocCounts[hub] = (roleLocCounts[hub] || 0) + 1;
      });
      if (item.locations.length === 0) {
        roleLocCounts['San Francisco'] = currentCount;
      }

      // Distribute shortage proportionally across this role's actual operating locations
      const locationDemand: ILocationDemand[] = [];
      const hubs = Object.keys(roleLocCounts);
      let remainingShortage = headcountShortage;

      hubs.forEach((hub, idx) => {
        const hubCount = roleLocCounts[hub];
        const isLast = idx === hubs.length - 1;
        const hubShortage = isLast
          ? remainingShortage
          : Math.min(remainingShortage, Math.round(headcountShortage * (hubCount / currentCount)));
        remainingShortage -= hubShortage;

        locationDemand.push({
          location: hub,
          currentCount: hubCount,
          projectedDemand: hubCount + hubShortage,
          shortage: hubShortage,
        });
      });

      // Relevant skills based on department / role
      let requiredSkills = ['Problem Solving', 'Communication', 'Collaboration'];
      const rLower = item.roleName.toLowerCase();
      const dLower = item.deptName.toLowerCase();
      if (dLower.includes('eng') || rLower.includes('engineer') || rLower.includes('developer') || rLower.includes('architect')) {
        requiredSkills = ['TypeScript', 'Node.js', 'System Design', 'Cloud Architecture', 'Docker'];
      } else if (dLower.includes('product') || dLower.includes('design') || rLower.includes('designer') || rLower.includes('product')) {
        requiredSkills = ['Product Strategy', 'UI/UX Design', 'Figma', 'Agile/Scrum', 'User Research'];
      } else if (dLower.includes('hr') || dLower.includes('talent') || dLower.includes('human')) {
        requiredSkills = ['Talent Acquisition', 'HRBP', 'Employee Relations', 'HR Analytics'];
      } else if (dLower.includes('finance') || rLower.includes('accountant') || rLower.includes('financial')) {
        requiredSkills = ['Financial Modeling', 'Budget Planning', 'Corporate Accounting', 'ERP'];
      } else if (dLower.includes('market') || rLower.includes('marketing') || rLower.includes('seo')) {
        requiredSkills = ['Growth Marketing', 'SEO', 'Brand Strategy', 'Campaign Analytics'];
      } else if (dLower.includes('operat') || rLower.includes('logistics')) {
        requiredSkills = ['Operations Management', 'Logistics', 'Process Automation', 'Compliance'];
      }

      await DemandForecast.create({
        departmentId: item.deptId || new mongoose.Types.ObjectId(),
        departmentName: item.deptName,
        roleName: item.roleName,
        roleCode: item.roleName.substring(0, 4).toUpperCase().replace(/\s/g, ''),
        currentHeadcount: currentCount,
        projectedDemand,
        headcountShortage,
        shortageSeverity,
        forecastHorizon: '12 Months',
        confidenceScore: 91.5,
        requiredSkills,
        quarterlyDemand,
        locationDemand,
        lastCalculatedAt: new Date(),
      });

      totalCount++;
    }

    return { processedCount: totalCount };
  }

  /**
   * Get Demand Forecasting Overview Analytics for Dashboard
   */
  public async getDemandForecastingOverview(forceRecalculate: boolean = false): Promise<{
    summary: {
      totalCurrentHeadcount: number;
      totalProjectedDemand: number;
      totalHeadcountShortage: number;
      totalEstimatedBudgetINR: number;
      criticalShortagesCount: number;
    };
    byDepartment: {
      departmentId: string;
      departmentName: string;
      currentHeadcount: number;
      projectedDemand: number;
      shortage: number;
    }[];
    byRole: {
      roleName: string;
      currentHeadcount: number;
      projectedDemand: number;
      shortage: number;
      severity: string;
    }[];
    quarterlyTimeline: {
      quarter: string;
      requiredHires: number;
      estimatedBudgetINR: number;
    }[];
    locationDemand: {
      location: string;
      currentCount: number;
      projectedDemand: number;
      shortage: number;
    }[];
    topRequiredSkills: { skillName: string; demandFrequency: number }[];
  }> {
    const totalEmpCount = await Employee.countDocuments({ isDeleted: false });
    const existingCount = await DemandForecast.countDocuments();
    const currentForecastTotal = await DemandForecast.aggregate([
      { $group: { _id: null, total: { $sum: '$currentHeadcount' } } },
    ]);
    const recordedTotal = currentForecastTotal[0]?.total || 0;

    // Recalculate if forced, empty, or if recorded total differs from real employee count by even 1
    if (forceRecalculate || existingCount === 0 || (totalEmpCount > 0 && recordedTotal !== totalEmpCount)) {
      await this.batchCalculateDemandForecasts();
    }

    const forecasts = await DemandForecast.find().populate('departmentId');

    let totalCurrent = 0;
    let totalProjected = 0;
    let totalShortage = 0;
    let totalBudgetINR = 0;
    let criticalCount = 0;

    const deptMap: Record<
      string,
      { name: string; current: number; projected: number; shortage: number }
    > = {};

    const roleList: any[] = [];
    const quarterMap: Record<string, { hires: number; budgetINR: number }> = {};
    const locMap: Record<string, { current: number; projected: number; shortage: number }> = {};
    const skillCounts: Record<string, number> = {};

    for (const f of forecasts) {
      totalCurrent += f.currentHeadcount;
      totalProjected += f.projectedDemand;
      totalShortage += f.headcountShortage;

      if (f.shortageSeverity === 'Critical' || f.shortageSeverity === 'Severe') {
        criticalCount++;
      }

      // Dept Map
      const deptIdStr = f.departmentId?._id ? f.departmentId._id.toString() : f.departmentName;
      if (!deptMap[deptIdStr]) {
        deptMap[deptIdStr] = {
          name: f.departmentName,
          current: 0,
          projected: 0,
          shortage: 0,
        };
      }
      deptMap[deptIdStr].current += f.currentHeadcount;
      deptMap[deptIdStr].projected += f.projectedDemand;
      deptMap[deptIdStr].shortage += f.headcountShortage;

      // Role list
      roleList.push({
        roleName: f.roleName,
        currentHeadcount: f.currentHeadcount,
        projectedDemand: f.projectedDemand,
        shortage: f.headcountShortage,
        severity: f.shortageSeverity,
      });

      // Quarterly sum
      for (const q of f.quarterlyDemand || []) {
        if (!quarterMap[q.quarter]) {
          quarterMap[q.quarter] = { hires: 0, budgetINR: 0 };
        }
        quarterMap[q.quarter].hires += q.requiredHires;
        quarterMap[q.quarter].budgetINR += q.estimatedBudgetINR;
        totalBudgetINR += q.estimatedBudgetINR;
      }

      // Location sum
      for (const loc of f.locationDemand || []) {
        if (!locMap[loc.location]) {
          locMap[loc.location] = { current: 0, projected: 0, shortage: 0 };
        }
        locMap[loc.location].current += loc.currentCount;
        locMap[loc.location].projected += loc.projectedDemand;
        locMap[loc.location].shortage += loc.shortage;
      }

      // Skill frequency
      for (const skill of f.requiredSkills || []) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }
    }

    const byDepartment = Object.entries(deptMap).map(([id, val]) => ({
      departmentId: id,
      departmentName: val.name,
      currentHeadcount: val.current,
      projectedDemand: val.projected,
      shortage: val.shortage,
    }));

    const quarterlyTimeline = Object.entries(quarterMap).map(([quarter, val]) => ({
      quarter,
      requiredHires: val.hires,
      estimatedBudgetINR: val.budgetINR,
    }));

    const locationDemand = Object.entries(locMap).map(([location, val]) => ({
      location,
      currentCount: val.current,
      projectedDemand: val.projected,
      shortage: val.shortage,
    }));

    const topRequiredSkills = Object.entries(skillCounts)
      .map(([skillName, demandFrequency]) => ({ skillName, demandFrequency }))
      .sort((a, b) => b.demandFrequency - a.demandFrequency);

    return {
      summary: {
        totalCurrentHeadcount: totalCurrent,
        totalProjectedDemand: totalProjected,
        totalHeadcountShortage: totalShortage,
        totalEstimatedBudgetINR: totalBudgetINR,
        criticalShortagesCount: criticalCount,
      },
      byDepartment,
      byRole: roleList.sort((a, b) => b.shortage - a.shortage),
      quarterlyTimeline,
      locationDemand,
      topRequiredSkills,
    };
  }
}

export default new DemandService();
