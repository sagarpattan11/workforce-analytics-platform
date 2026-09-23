import { Request, Response } from 'express';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { Team } from '../models/team.model';

/**
 * GET /api/v1/analytics/dashboard
 * Aggregates live workforce statistics from MongoDB for the 8 KPI cards and 6 charts.
 */
export const getDashboardAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    // -------------------------------------------------------------
    // 1. COMPUTE THE 8 KPI CARDS
    // -------------------------------------------------------------
    const [
      totalEmployees,
      activeEmployees,
      employeesOnLeave,
      newHires,
      totalDepartments,
      totalTeams,
    ] = await Promise.all([
      // Total non-deleted employees
      Employee.countDocuments({ isDeleted: { $ne: true } }),
      // Active status employees
      Employee.countDocuments({ isDeleted: { $ne: true }, status: 'Active' }),
      // Employees on leave
      Employee.countDocuments({ isDeleted: { $ne: true }, status: 'On Leave' }),
      // Hired within the last 30 days
      Employee.countDocuments({ isDeleted: { $ne: true }, hireDate: { $gte: thirtyDaysAgo } }),
      // Active departments
      Department.countDocuments({ isActive: true }),
      // Active teams
      Team.countDocuments({ isActive: true }),
    ]);

    // Present today = Active employees not on leave
    const employeesPresentToday = Math.max(0, activeEmployees - employeesOnLeave);

    // Attendance percentage
    const attendancePercentage =
      totalEmployees > 0
        ? Number((((totalEmployees - employeesOnLeave) / totalEmployees) * 100).toFixed(1))
        : 100;

    const kpiMetrics = {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalTeams,
      employeesPresentToday,
      employeesOnLeave,
      newHires,
      attendancePercentage,
    };

    // -------------------------------------------------------------
    // 2. COMPUTE THE 6 CHARTS (MongoDB Aggregation Pipelines)
    // -------------------------------------------------------------
    const [
      employeesByDepartment,
      employeesByLocation,
      employmentTypeDistribution,
      employeeStatusDistribution,
      monthlyHiresRaw,
    ] = await Promise.all([
      // Chart 1: Employees by Department
      Employee.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $lookup: {
            from: 'departments',
            localField: 'departmentId',
            foreignField: '_id',
            as: 'department',
          },
        },
        { $unwind: '$department' },
        { $group: { _id: '$department.name', count: { $sum: 1 } } },
        { $project: { name: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Chart 2: Employees by Location
      Employee.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $project: { location: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Chart 3: Employment Type Distribution (Full-time, Part-time, Contract, Intern)
      Employee.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Chart 5: Employee Status Distribution (Active, On Leave, Inactive, Terminated)
      Employee.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Aggregate hires by month (for Growth and Hiring Trend)
      Employee.aggregate([
        {
          $match: {
            isDeleted: { $ne: true },
            hireDate: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$hireDate' },
              month: { $month: '$hireDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Format Monthly Hires & Cumulative Growth
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    // Build continuous timeline for past 6 months (Recent Hiring Trend)
    const recentHiringTrend: { month: string; hires: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const found = monthlyHiresRaw.find(
        (m: any) => m._id.year === year && m._id.month === month
      );
      recentHiringTrend.push({
        month: monthLabel,
        hires: found ? found.count : 0,
      });
    }

    // Build continuous timeline for past 12 months (Employee Growth)
    let cumulative = 0;
    const employeeGrowth: { month: string; newHires: number; totalHeadcount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const found = monthlyHiresRaw.find(
        (m: any) => m._id.year === year && m._id.month === month
      );
      const hires = found ? found.count : 0;
      cumulative += hires;

      employeeGrowth.push({
        month: monthLabel,
        newHires: hires,
        totalHeadcount: cumulative,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        kpi: kpiMetrics,
        charts: {
          employeesByDepartment,
          employeesByLocation,
          employmentTypeDistribution,
          employeeGrowth,
          employeeStatusDistribution,
          recentHiringTrend,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard analytics',
      error: error.message,
    });
  }
};
