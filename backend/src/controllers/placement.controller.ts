import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Placement } from '../models/placement.model';
import { Department } from '../models/department.model';

/**
 * GET /api/v1/analytics/placement
 * Calculates Placement KPIs, Funnels, Salary Analysis, and Segmentations.
 */
export const getPlacementAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      department,
      departmentId,
      role,
      location,
      skill,
      employer,
      status,
      startDate,
      endDate,
    } = req.query;

    // 1. Build Base Match Filter
    const matchFilter: Record<string, any> = {};

    // Department Filter (by ID or Code/Name)
    const deptQuery = (departmentId || department) as string;
    if (deptQuery) {
      if (mongoose.Types.ObjectId.isValid(deptQuery)) {
        matchFilter.departmentId = new mongoose.Types.ObjectId(deptQuery);
      } else {
        const foundDept = await Department.findOne({
          $or: [
            { code: deptQuery.toUpperCase() },
            { name: new RegExp(deptQuery, 'i') },
          ],
        });
        if (foundDept) {
          matchFilter.departmentId = foundDept._id;
        }
      }
    }

    // Role / Title Filter
    if (role && typeof role === 'string') {
      matchFilter.roleTitle = new RegExp(role, 'i');
    }

    // Location Filter
    if (location && typeof location === 'string') {
      matchFilter.location = location;
    }

    // Employer Filter
    if (employer && typeof employer === 'string') {
      matchFilter.employer = employer;
    }

    // Skill Filter (array contains)
    if (skill && typeof skill === 'string') {
      matchFilter.skills = { $in: [new RegExp(skill, 'i')] };
    }

    // Status Filter ('In Progress', 'Placed', 'Failed')
    if (status && typeof status === 'string') {
      matchFilter.status = status;
    }

    // Date Range Filter (on applicationDate)
    if (startDate || endDate) {
      matchFilter.applicationDate = {};
      if (startDate) {
        matchFilter.applicationDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.applicationDate.$lte = new Date(endDate as string);
      }
    }

    // -------------------------------------------------------------
    // 2. High-Level KPI Aggregations
    // -------------------------------------------------------------
    const [totalCandidates, placedCandidates] = await Promise.all([
      Placement.countDocuments(matchFilter).maxTimeMS(5000),
      Placement.countDocuments({ ...matchFilter, stage: 'Placed' }).maxTimeMS(5000),
    ]);

    const placementRate = totalCandidates > 0
      ? Number(((placedCandidates / totalCandidates) * 100).toFixed(1))
      : 0;

    // Average Placement Time (Days) for placed candidates
    const avgTimeResult = await Placement.aggregate([
      { $match: { ...matchFilter, stage: 'Placed', daysToPlace: { $ne: null } } },
      { $group: { _id: null, avgDays: { $avg: '$daysToPlace' } } },
    ]);

    const averagePlacementTimeDays = avgTimeResult.length > 0 && avgTimeResult[0].avgDays
      ? Math.round(avgTimeResult[0].avgDays)
      : 0;

    // -------------------------------------------------------------
    // 3. Salary Analysis (Min, Max, Avg, Median)
    // -------------------------------------------------------------
    const salaryDocs = await Placement.find({
      ...matchFilter,
      stage: 'Placed',
      'salary.baseSalary': { $gt: 0 },
    })
      .select('salary.baseSalary')
      .sort({ 'salary.baseSalary': 1 })
      .lean()
      .maxTimeMS(5000);

    let minSalary = 0;
    let maxSalary = 0;
    let avgSalary = 0;
    let medianSalary = 0;

    if (salaryDocs.length > 0) {
      const salaries = salaryDocs.map((d: any) => d.salary.baseSalary);
      minSalary = salaries[0];
      maxSalary = salaries[salaries.length - 1];
      const sum = salaries.reduce((acc: number, val: number) => acc + val, 0);
      avgSalary = Math.round(sum / salaries.length);

      const mid = Math.floor(salaries.length / 2);
      medianSalary = salaries.length % 2 !== 0
        ? salaries[mid]
        : Math.round((salaries[mid - 1] + salaries[mid]) / 2);
    }

    // -------------------------------------------------------------
    // 4. Placement Funnel Stages (Cumulative Progression Funnel)
    // Applied -> Screened -> Interviewed -> Offered -> Placed
    // -------------------------------------------------------------
    const funnelCounts = await Placement.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const funnelMap = new Map<string, number>(funnelCounts.map((f: any) => [f._id, f.count]));

    const appliedCurrent = funnelMap.get('Applied') || 0;
    const screenedCurrent = funnelMap.get('Screened') || 0;
    const interviewedCurrent = funnelMap.get('Interviewed') || 0;
    const offeredCurrent = funnelMap.get('Offered') || 0;
    const placedCount = funnelMap.get('Placed') || 0;
    const withdrawnCount = funnelMap.get('Withdrawn') || 0;
    const rejectedCount = funnelMap.get('Rejected') || 0;

    // Cumulative Progression Funnel:
    // Placed candidates reached all 5 stages.
    // Offered candidates reached 4 stages (Applied -> Screened -> Interviewed -> Offered).
    // Interviewed candidates reached 3 stages (Applied -> Screened -> Interviewed).
    // Screened candidates reached 2 stages (Applied -> Screened).
    // Applied candidates reached 1 stage (Applied).
    // Withdrawn/Rejected candidates at least submitted an initial application.
    const totalApplied =
      appliedCurrent +
      screenedCurrent +
      interviewedCurrent +
      offeredCurrent +
      placedCount +
      withdrawnCount +
      rejectedCount;
    const totalScreened = screenedCurrent + interviewedCurrent + offeredCurrent + placedCount;
    const totalInterviewed = interviewedCurrent + offeredCurrent + placedCount;
    const totalOffered = offeredCurrent + placedCount;
    const totalPlaced = placedCount;

    const placementFunnel = [
      { stage: 'Applied', count: totalApplied, label: 'Applications Received' },
      { stage: 'Screened', count: totalScreened, label: 'Profile Screened' },
      { stage: 'Interviewed', count: totalInterviewed, label: 'Technical Interviews' },
      { stage: 'Offered', count: totalOffered, label: 'Job Offers Sent' },
      { stage: 'Placed', count: totalPlaced, label: 'Successful Placements' },
    ];

    // Current Active Pipeline status counts:
    const stageBreakdown = {
      applied: appliedCurrent,
      screened: screenedCurrent,
      interviewed: interviewedCurrent,
      offered: offeredCurrent,
      placed: placedCount,
      withdrawn: withdrawnCount,
      rejected: rejectedCount,
    };

    // -------------------------------------------------------------
    // 5. Breakdowns (Department, Employer, Skill, Location)
    // -------------------------------------------------------------

    // A. By Department
    const deptAgg = await Placement.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$stage', 'Placed'] }, 1, 0] },
          },
          avgSalary: {
            $avg: {
              $cond: [{ $eq: ['$stage', 'Placed'] }, '$salary.baseSalary', null],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          departmentId: '$_id',
          departmentName: { $ifNull: ['$dept.name', 'General'] },
          departmentCode: { $ifNull: ['$dept.code', 'GEN'] },
          total: 1,
          placed: 1,
          placementRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 1] },
              0,
            ],
          },
          avgSalary: { $round: [{ $ifNull: ['$avgSalary', 0] }, 0] },
        },
      },
      { $sort: { placed: -1 } },
    ]);

    // B. By Employer
    const employerAgg = await Placement.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$employer',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$stage', 'Placed'] }, 1, 0] },
          },
          avgSalary: {
            $avg: {
              $cond: [{ $eq: ['$stage', 'Placed'] }, '$salary.baseSalary', null],
            },
          },
        },
      },
      {
        $project: {
          employer: '$_id',
          total: 1,
          placed: 1,
          avgSalary: { $round: [{ $ifNull: ['$avgSalary', 0] }, 0] },
        },
      },
      { $sort: { placed: -1, total: -1 } },
      { $limit: 8 },
    ]);

    // C. By Skill
    const skillAgg = await Placement.aggregate([
      { $match: matchFilter },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          candidateCount: { $sum: 1 },
          placedCount: {
            $sum: { $cond: [{ $eq: ['$stage', 'Placed'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          skill: '$_id',
          candidateCount: 1,
          placedCount: 1,
        },
      },
      { $sort: { placedCount: -1, candidateCount: -1 } },
      { $limit: 8 },
    ]);

    // D. By Location
    const locationAgg = await Placement.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$location',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$stage', 'Placed'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          location: '$_id',
          total: 1,
          placed: 1,
        },
      },
      { $sort: { placed: -1 } },
    ]);

    // -------------------------------------------------------------
    // 6. Recent Candidates (Top 10 most recent)
    // -------------------------------------------------------------
    const recentCandidates = await Placement.find(matchFilter)
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .maxTimeMS(5000);

    // -------------------------------------------------------------
    // 7. Return Formatted Analytics Response
    // -------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: 'Placement analytics retrieved successfully',
      data: {
        kpis: {
          totalCandidates,
          candidatesPlaced: placedCandidates,
          placementRate,
          averagePlacementTimeDays,
          salaryAnalysis: {
            minSalary,
            maxSalary,
            avgSalary,
            medianSalary,
            currency: 'USD',
          },
        },
        funnel: placementFunnel,
        stageBreakdown,
        breakdowns: {
          byDepartment: deptAgg,
          byEmployer: employerAgg,
          bySkill: skillAgg,
          byLocation: locationAgg,
        },
        recentCandidates,
      },
    });
  } catch (error: any) {
    console.error('Error in getPlacementAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve placement analytics',
      error: error.message,
    });
  }
};
