import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Recruitment } from '../models/recruitment.model';

// ============================================================================
// RECRUITMENT ANALYTICS CONTROLLER
// ============================================================================

/**
 * GET /api/v1/analytics/recruitment
 * Returns aggregated recruitment metrics, 5-stage hiring funnel,
 * sourcing channel efficiency, department breakdowns, and active requisitions.
 */
export const getRecruitmentAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      department,
      departmentId,
      location,
      priority,
      status,
      channel,
      startDate,
      endDate,
    } = req.query;

    // -------------------------------------------------------------
    // 1. Build Query Match Filter
    // -------------------------------------------------------------
    const matchFilter: Record<string, any> = {};

    // Department Filter
    const targetDept = departmentId || department;
    if (targetDept && typeof targetDept === 'string') {
      if (/^[0-9a-fA-F]{24}$/.test(targetDept)) {
        matchFilter.departmentId = new mongoose.Types.ObjectId(targetDept);
      }
    }

    // Location Filter
    if (location && typeof location === 'string') {
      matchFilter.location = location;
    }

    // Priority Filter ('Low', 'Medium', 'High', 'Critical')
    if (priority && typeof priority === 'string') {
      matchFilter.priority = priority;
    }

    // Status Filter ('Open', 'Interviewing', 'Offer Sent', 'Closed', 'Cancelled')
    if (status && typeof status === 'string') {
      matchFilter.status = status;
    }

    // Sourcing Channel Filter ('LinkedIn', 'Referral', 'Career Portal', 'Campus', 'Agency', 'Direct')
    if (channel && typeof channel === 'string') {
      matchFilter.sourcingChannel = channel;
    }

    // Date Range Filter (on targetHireDate or createdAt)
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) {
        matchFilter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // -------------------------------------------------------------
    // 2. High-Level Recruitment KPIs Aggregation
    // -------------------------------------------------------------
    const kpiResult = await Recruitment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalRequisitions: { $sum: 1 },
          totalOpenPositions: { $sum: '$openPositions' },
          totalFilledPositions: { $sum: '$filledPositions' },
          totalApplications: { $sum: '$applicationsCount' },
          totalShortlisted: { $sum: '$shortlistedCount' },
          totalInterviewed: { $sum: '$interviewedCount' },
          totalOffers: { $sum: '$offersCount' },
          totalHires: { $sum: '$hiresCount' },
          avgTimeToHireDays: { $avg: '$timeToHireDays' },
          avgCostPerHire: { $avg: '$costPerHire' },
          avgOfferAcceptanceRate: { $avg: '$offerAcceptanceRate' },
        },
      },
    ]);

    const kpiData = kpiResult.length > 0
      ? kpiResult[0]
      : {
          totalRequisitions: 0,
          totalOpenPositions: 0,
          totalFilledPositions: 0,
          totalApplications: 0,
          totalShortlisted: 0,
          totalInterviewed: 0,
          totalOffers: 0,
          totalHires: 0,
          avgTimeToHireDays: 0,
          avgCostPerHire: 0,
          avgOfferAcceptanceRate: 0,
        };

    const overallOfferAcceptanceRate = kpiData.totalOffers > 0
      ? Number(((kpiData.totalHires / kpiData.totalOffers) * 100).toFixed(1))
      : Number(kpiData.avgOfferAcceptanceRate.toFixed(1));

    const kpis = {
      totalRequisitions: kpiData.totalRequisitions,
      openPositions: kpiData.totalOpenPositions,
      filledPositions: kpiData.totalFilledPositions,
      applications: kpiData.totalApplications,
      shortlisted: kpiData.totalShortlisted,
      interviews: kpiData.totalInterviewed,
      offers: kpiData.totalOffers,
      successfulHires: kpiData.totalHires,
      timeToHireDays: Math.round(kpiData.avgTimeToHireDays || 0),
      costPerHire: Math.round(kpiData.avgCostPerHire || 0),
      offerAcceptanceRate: overallOfferAcceptanceRate,
    };

    // -------------------------------------------------------------
    // 3. Recruitment Funnel (Cumulative Progression)
    // Applications -> Shortlisted -> Interviewed -> Offers -> Hires
    // -------------------------------------------------------------
    const recruitmentFunnel = [
      {
        stage: 'Applications',
        count: kpis.applications,
        label: 'Total Applications',
        percentage: 100,
      },
      {
        stage: 'Shortlisted',
        count: kpis.shortlisted,
        label: 'Profiles Shortlisted',
        percentage: kpis.applications > 0
          ? Number(((kpis.shortlisted / kpis.applications) * 100).toFixed(1))
          : 0,
      },
      {
        stage: 'Interviewed',
        count: kpis.interviews,
        label: 'Candidate Interviews',
        percentage: kpis.applications > 0
          ? Number(((kpis.interviews / kpis.applications) * 100).toFixed(1))
          : 0,
      },
      {
        stage: 'Offers',
        count: kpis.offers,
        label: 'Offers Extended',
        percentage: kpis.applications > 0
          ? Number(((kpis.offers / kpis.applications) * 100).toFixed(1))
          : 0,
      },
      {
        stage: 'Hires',
        count: kpis.successfulHires,
        label: 'Successful Hires',
        percentage: kpis.applications > 0
          ? Number(((kpis.successfulHires / kpis.applications) * 100).toFixed(1))
          : 0,
      },
    ];

    // -------------------------------------------------------------
    // 4. Breakdown by Sourcing Channel
    // Efficiency: applications, hires, costPerHire, hireRate
    // -------------------------------------------------------------
    const channelAgg = await Recruitment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$sourcingChannel',
          totalApplications: { $sum: '$applicationsCount' },
          totalHires: { $sum: '$hiresCount' },
          avgCost: { $avg: '$costPerHire' },
          avgTimeToHire: { $avg: '$timeToHireDays' },
          requisitionsCount: { $sum: 1 },
        },
      },
      { $sort: { totalHires: -1, totalApplications: -1 } },
    ]);

    const byChannel = channelAgg.map((c: any) => ({
      channel: c._id || 'Unknown',
      applications: c.totalApplications,
      hires: c.totalHires,
      hireRate: c.totalApplications > 0
        ? Number(((c.totalHires / c.totalApplications) * 100).toFixed(1))
        : 0,
      costPerHire: Math.round(c.avgCost || 0),
      timeToHireDays: Math.round(c.avgTimeToHire || 0),
      requisitionsCount: c.requisitionsCount,
    }));

    // -------------------------------------------------------------
    // 5. Breakdown by Department
    // -------------------------------------------------------------
    const deptAgg = await Recruitment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$departmentId',
          openPositions: { $sum: '$openPositions' },
          filledPositions: { $sum: '$filledPositions' },
          applications: { $sum: '$applicationsCount' },
          hires: { $sum: '$hiresCount' },
          avgTimeToHire: { $avg: '$timeToHireDays' },
          avgCost: { $avg: '$costPerHire' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { openPositions: -1 } },
    ]);

    const byDepartment = deptAgg.map((d: any) => ({
      departmentId: d._id ? d._id.toString() : 'Unknown',
      departmentName: d.deptInfo?.name || 'Cross-Departmental',
      departmentCode: d.deptInfo?.code || 'CORP',
      openPositions: d.openPositions,
      filledPositions: d.filledPositions,
      applications: d.applications,
      hires: d.hires,
      avgTimeToHire: Math.round(d.avgTimeToHire || 0),
      avgCost: Math.round(d.avgCost || 0),
    }));

    // -------------------------------------------------------------
    // 6. Breakdown by Priority
    // -------------------------------------------------------------
    const priorityAgg = await Recruitment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          openPositions: { $sum: '$openPositions' },
          hires: { $sum: '$hiresCount' },
        },
      },
      { $sort: { openPositions: -1 } },
    ]);

    const byPriority = priorityAgg.map((p: any) => ({
      priority: p._id || 'Medium',
      requisitionsCount: p.count,
      openPositions: p.openPositions,
      hires: p.hires,
    }));

    // -------------------------------------------------------------
    // 7. Active Requisitions Directory (Drill-Down Table)
    // -------------------------------------------------------------
    const activeRequisitions = await Recruitment.find(matchFilter)
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    res.status(200).json({
      success: true,
      message: 'Recruitment analytics calculated successfully',
      data: {
        kpis,
        funnel: recruitmentFunnel,
        breakdowns: {
          byChannel,
          byDepartment,
          byPriority,
        },
        activeRequisitions,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
