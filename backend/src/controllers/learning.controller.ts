import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { LearningRecord } from '../models/learning-record.model';
import { Training } from '../models/training.model';
import { Skill } from '../models/skill.model';
import { Department } from '../models/department.model';

// ============================================================================
// LEARNING & DEVELOPMENT ANALYTICS CONTROLLER
// ============================================================================

/**
 * GET /api/v1/analytics/learning
 * Returns comprehensive learning & development metrics, course completion funnels,
 * assessment score distributions, skill-linkage breakdowns, and recent activity.
 */
export const getLearningAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      department,
      departmentId,
      category,
      skill,
      targetSkillId,
      status,
      startDate,
      endDate,
    } = req.query;

    // -------------------------------------------------------------
    // 1. Build Query Match Filter
    // -------------------------------------------------------------
    const matchFilter: Record<string, any> = {};

    // Department Filter (Supports ObjectId or Name/Code)
    const targetDept = departmentId || department;
    if (targetDept && typeof targetDept === 'string') {
      if (/^[0-9a-fA-F]{24}$/.test(targetDept)) {
        matchFilter.departmentId = new mongoose.Types.ObjectId(targetDept);
      } else {
        const matchingDepts = await Department.find({
          $or: [
            { name: new RegExp(targetDept, 'i') },
            { code: new RegExp(targetDept, 'i') },
          ],
        }).select('_id');
        if (matchingDepts.length > 0) {
          matchFilter.departmentId = { $in: matchingDepts.map((d) => d._id) };
        }
      }
    }

    // Training Category Filter (e.g. Technical, Leadership, Compliance)
    if (category && typeof category === 'string') {
      const matchingTrainings = await Training.find({
        category: new RegExp(category, 'i'),
      }).select('_id');
      if (matchingTrainings.length > 0) {
        matchFilter.trainingId = { $in: matchingTrainings.map((t) => t._id) };
      }
    }

    // Target Skill Filter (Supports ObjectId or Skill Name)
    const targetSkill = targetSkillId || skill;
    if (targetSkill && typeof targetSkill === 'string') {
      if (/^[0-9a-fA-F]{24}$/.test(targetSkill)) {
        matchFilter.targetSkillId = new mongoose.Types.ObjectId(targetSkill);
      } else {
        const matchingSkills = await Skill.find({
          name: new RegExp(targetSkill, 'i'),
        }).select('_id');
        if (matchingSkills.length > 0) {
          matchFilter.targetSkillId = { $in: matchingSkills.map((s) => s._id) };
        }
      }
    }

    // Status Filter ('Enrolled', 'In Progress', 'Completed', 'Dropped')
    if (status && typeof status === 'string') {
      matchFilter.status = status;
    }

    // Date Range Filter (on enrolmentDate)
    if (startDate || endDate) {
      matchFilter.enrolmentDate = {};
      if (startDate) {
        matchFilter.enrolmentDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        matchFilter.enrolmentDate.$lte = new Date(endDate as string);
      }
    }

    // -------------------------------------------------------------
    // 2. High-Level Learning KPIs Aggregation
    // -------------------------------------------------------------
    const kpiResult = await LearningRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalEnrolments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
          },
          enrolled: {
            $sum: { $cond: [{ $eq: ['$status', 'Enrolled'] }, 1, 0] },
          },
          dropped: {
            $sum: { $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0] },
          },
          totalHours: { $sum: '$hoursSpent' },
          certificationsEarned: {
            $sum: { $cond: ['$certificationEarned', 1, 0] },
          },
          passedAssessments: {
            $sum: { $cond: ['$passedAssessment', 1, 0] },
          },
          scoredCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$assessmentScore', null] },
                    { $gte: ['$assessmentScore', 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgAssessmentScore: { $avg: '$assessmentScore' },
          avgEffectivenessRating: { $avg: '$effectivenessRating' },
          uniqueLearners: { $addToSet: '$employeeId' },
        },
      },
    ]);

    const rawKpis = kpiResult.length > 0
      ? kpiResult[0]
      : {
          totalEnrolments: 0,
          completed: 0,
          inProgress: 0,
          enrolled: 0,
          dropped: 0,
          totalHours: 0,
          certificationsEarned: 0,
          passedAssessments: 0,
          scoredCount: 0,
          avgAssessmentScore: 0,
          avgEffectivenessRating: 0,
          uniqueLearners: [],
        };

    const totalEnrolments = rawKpis.totalEnrolments;
    const completedCount = rawKpis.completed;
    const completionRate = totalEnrolments > 0
      ? Number(((completedCount / totalEnrolments) * 100).toFixed(1))
      : 0;

    const uniqueLearnersCount = rawKpis.uniqueLearners ? rawKpis.uniqueLearners.length : 0;
    const avgHoursPerLearner = uniqueLearnersCount > 0
      ? Number((rawKpis.totalHours / uniqueLearnersCount).toFixed(1))
      : 0;

    const scoredCount = rawKpis.scoredCount || 0;
    const passRate = scoredCount > 0
      ? Number(((rawKpis.passedAssessments / scoredCount) * 100).toFixed(1))
      : 0;

    const kpis = {
      totalEnrolments,
      completedEnrolments: completedCount,
      inProgressEnrolments: rawKpis.inProgress,
      activeEnrolments: rawKpis.enrolled,
      droppedEnrolments: rawKpis.dropped,
      completionRate,
      totalHoursSpent: rawKpis.totalHours,
      uniqueLearners: uniqueLearnersCount,
      avgHoursPerLearner,
      avgAssessmentScore: Number((rawKpis.avgAssessmentScore || 0).toFixed(1)),
      passedAssessments: rawKpis.passedAssessments,
      passRate,
      certificationsEarned: rawKpis.certificationsEarned,
      avgEffectivenessRating: Number((rawKpis.avgEffectivenessRating || 0).toFixed(2)),
    };

    // -------------------------------------------------------------
    // 3. Status Distribution Funnel / Breakdown
    // -------------------------------------------------------------
    const statusDistribution = [
      {
        status: 'Enrolled',
        count: rawKpis.enrolled,
        percentage: totalEnrolments > 0 ? Number(((rawKpis.enrolled / totalEnrolments) * 100).toFixed(1)) : 0,
      },
      {
        status: 'In Progress',
        count: rawKpis.inProgress,
        percentage: totalEnrolments > 0 ? Number(((rawKpis.inProgress / totalEnrolments) * 100).toFixed(1)) : 0,
      },
      {
        status: 'Completed',
        count: completedCount,
        percentage: totalEnrolments > 0 ? Number(((completedCount / totalEnrolments) * 100).toFixed(1)) : 0,
      },
      {
        status: 'Dropped',
        count: rawKpis.dropped,
        percentage: totalEnrolments > 0 ? Number(((rawKpis.dropped / totalEnrolments) * 100).toFixed(1)) : 0,
      },
    ];

    // -------------------------------------------------------------
    // 4. Assessment Score Tier Distribution
    // -------------------------------------------------------------
    const scoreTiersAgg = await LearningRecord.aggregate([
      {
        $match: {
          ...matchFilter,
          assessmentScore: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          needsImprovement: {
            $sum: { $cond: [{ $lt: ['$assessmentScore', 60] }, 1, 0] },
          },
          developing: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$assessmentScore', 60] },
                    { $lt: ['$assessmentScore', 75] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          proficient: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$assessmentScore', 75] },
                    { $lt: ['$assessmentScore', 90] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          mastery: {
            $sum: { $cond: [{ $gte: ['$assessmentScore', 90] }, 1, 0] },
          },
        },
      },
    ]);

    const tiers = scoreTiersAgg.length > 0
      ? scoreTiersAgg[0]
      : { needsImprovement: 0, developing: 0, proficient: 0, mastery: 0 };

    const scoreDistribution = [
      { tier: '< 60% (Needs Improvement)', count: tiers.needsImprovement, fill: '#EF4444' },
      { tier: '60% - 74% (Developing)', count: tiers.developing, fill: '#F59E0B' },
      { tier: '75% - 89% (Proficient)', count: tiers.proficient, fill: '#3B82F6' },
      { tier: '90% - 100% (Mastery)', count: tiers.mastery, fill: '#10B981' },
    ];

    // -------------------------------------------------------------
    // 5. Department Breakdown Aggregation
    // -------------------------------------------------------------
    const deptAgg = await LearningRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$departmentId',
          totalEnrolments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          totalHours: { $sum: '$hoursSpent' },
          certifications: {
            $sum: { $cond: ['$certificationEarned', 1, 0] },
          },
          avgScore: { $avg: '$assessmentScore' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      {
        $project: {
          departmentId: '$_id',
          departmentName: {
            $ifNull: [{ $arrayElemAt: ['$departmentInfo.name', 0] }, 'Unassigned'],
          },
          departmentCode: {
            $ifNull: [{ $arrayElemAt: ['$departmentInfo.code', 0] }, 'GEN'],
          },
          totalEnrolments: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalEnrolments', 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ['$completed', '$totalEnrolments'] }, 100] },
                  1,
                ],
              },
              0,
            ],
          },
          totalHours: 1,
          certifications: 1,
          avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 1] },
        },
      },
      { $sort: { totalEnrolments: -1 } },
    ]);

    // -------------------------------------------------------------
    // 6. Category Breakdown Aggregation
    // -------------------------------------------------------------
    const categoryAgg = await LearningRecord.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'trainings',
          localField: 'trainingId',
          foreignField: '_id',
          as: 'trainingInfo',
        },
      },
      {
        $project: {
          status: 1,
          hoursSpent: 1,
          assessmentScore: 1,
          effectivenessRating: 1,
          category: {
            $ifNull: [{ $arrayElemAt: ['$trainingInfo.category', 0] }, 'General'],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          totalEnrolments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          totalHours: { $sum: '$hoursSpent' },
          avgScore: { $avg: '$assessmentScore' },
          avgEffectiveness: { $avg: '$effectivenessRating' },
        },
      },
      {
        $project: {
          category: '$_id',
          totalEnrolments: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalEnrolments', 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ['$completed', '$totalEnrolments'] }, 100] },
                  1,
                ],
              },
              0,
            ],
          },
          totalHours: 1,
          avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 1] },
          avgEffectiveness: { $round: [{ $ifNull: ['$avgEffectiveness', 0] }, 2] },
        },
      },
      { $sort: { totalEnrolments: -1 } },
    ]);

    // -------------------------------------------------------------
    // 7. Skill Breakdown Aggregation
    // -------------------------------------------------------------
    const skillAgg = await LearningRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$targetSkillId',
          enrolments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          certifications: {
            $sum: { $cond: ['$certificationEarned', 1, 0] },
          },
          avgScore: { $avg: '$assessmentScore' },
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skillInfo',
        },
      },
      {
        $project: {
          skillId: '$_id',
          skill: {
            $ifNull: [{ $arrayElemAt: ['$skillInfo.name', 0] }, 'General Skill'],
          },
          category: {
            $ifNull: [{ $arrayElemAt: ['$skillInfo.category', 0] }, 'Technical'],
          },
          enrolments: 1,
          completed: 1,
          certifications: 1,
          avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 1] },
        },
      },
      { $sort: { enrolments: -1 } },
      { $limit: 10 },
    ]);

    // -------------------------------------------------------------
    // 8. Top Training Courses Aggregation
    // -------------------------------------------------------------
    const courseAgg = await LearningRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$trainingId',
          enrolments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          certifications: {
            $sum: { $cond: ['$certificationEarned', 1, 0] },
          },
          avgScore: { $avg: '$assessmentScore' },
          avgRating: { $avg: '$effectivenessRating' },
        },
      },
      {
        $lookup: {
          from: 'trainings',
          localField: '_id',
          foreignField: '_id',
          as: 'trainingInfo',
        },
      },
      {
        $project: {
          trainingId: '$_id',
          title: {
            $ifNull: [{ $arrayElemAt: ['$trainingInfo.title', 0] }, 'Course'],
          },
          category: {
            $ifNull: [{ $arrayElemAt: ['$trainingInfo.category', 0] }, 'General'],
          },
          provider: {
            $ifNull: [{ $arrayElemAt: ['$trainingInfo.provider', 0] }, 'Internal Academy'],
          },
          durationHours: {
            $ifNull: [{ $arrayElemAt: ['$trainingInfo.durationHours', 0] }, 10],
          },
          enrolments: 1,
          completed: 1,
          completionRate: {
            $cond: [
              { $gt: ['$enrolments', 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ['$completed', '$enrolments'] }, 100] },
                  1,
                ],
              },
              0,
            ],
          },
          certifications: 1,
          avgScore: { $round: [{ $ifNull: ['$avgScore', 0] }, 1] },
          avgRating: { $round: [{ $ifNull: ['$avgRating', 0] }, 2] },
        },
      },
      { $sort: { enrolments: -1 } },
      { $limit: 10 },
    ]);

    // -------------------------------------------------------------
    // 9. Recent Learning Records Activity Directory
    // -------------------------------------------------------------
    const recentRecords = await LearningRecord.find(matchFilter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(20)
      .populate('employeeId', 'firstName lastName email employeeId position')
      .populate('trainingId', 'title category provider durationHours')
      .populate('targetSkillId', 'name category')
      .populate('departmentId', 'name code')
      .lean();

    // -------------------------------------------------------------
    // 10. Send Consolidated Analytics Response
    // -------------------------------------------------------------
    res.status(200).json({
      success: true,
      message: 'Learning analytics retrieved successfully',
      data: {
        kpis,
        statusDistribution,
        scoreDistribution,
        breakdowns: {
          byDepartment: deptAgg,
          byCategory: categoryAgg,
          bySkill: skillAgg,
          byCourse: courseAgg,
        },
        recentRecords,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
