import { Request, Response } from 'express';
import { Skill } from '../models/skill.model';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { Training } from '../models/training.model';

/**
 * GET /api/v1/skills
 * Returns all skills.
 */
export const getSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, departmentId } = req.query;
    const filter: Record<string, any> = { isActive: true };

    if (category) filter.category = category;
    if (departmentId) filter.departmentIds = departmentId;

    const skills = await Skill.find(filter)
      .populate('departmentIds', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error: any) {
    console.error('Error in getSkills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve skills',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/skills
 * Create a new skill in the catalog.
 */
export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, description, departmentIds, requiredHeadcount, benchmarkScore } = req.body;

    if (!name || !category) {
      res.status(400).json({
        success: false,
        message: 'Name and category are required',
      });
      return;
    }

    const existing = await Skill.findOne({ name });
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Skill '${name}' already exists`,
      });
      return;
    }

    const newSkill = await Skill.create({
      name,
      category,
      description,
      departmentIds: departmentIds || [],
      requiredHeadcount: requiredHeadcount ? Number(requiredHeadcount) : 5,
      benchmarkScore: benchmarkScore ? Number(benchmarkScore) : 80,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: newSkill,
    });
  } catch (error: any) {
    console.error('Error in createSkill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create skill',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/skills/analytics
 * Returns comprehensive analytics for the 7 Skill Analytics Module panels.
 */
export const getSkillAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.query;

    // 1. Fetch all active skills
    const skillQuery: Record<string, any> = { isActive: true };
    if (departmentId) {
      skillQuery.departmentIds = departmentId;
    }
    const allSkills = await Skill.find(skillQuery).lean();

    // 2. Fetch all active employees
    const empQuery: Record<string, any> = { isDeleted: { $ne: true }, status: 'Active' };
    if (departmentId) {
      empQuery.departmentId = departmentId;
    }
    const allEmployees = await Employee.find(empQuery).lean();

    // 3. Compute Skill Counts & Availability
    const skillCountMap = new Map<string, { available: number; certified: number; totalRating: number }>();
    allSkills.forEach((s) => {
      skillCountMap.set(s.name.toLowerCase(), { available: 0, certified: 0, totalRating: 0 });
    });

    let totalCertifications = 0;
    let totalAssessedSkills = 0;

    allEmployees.forEach((emp) => {
      if (emp.skills && Array.isArray(emp.skills)) {
        emp.skills.forEach((sk) => {
          totalAssessedSkills++;
          if (sk.certified) totalCertifications++;

          const key = sk.name.toLowerCase();
          const existing = skillCountMap.get(key) || { available: 0, certified: 0, totalRating: 0 };
          existing.available++;
          if (sk.certified) existing.certified++;
          skillCountMap.set(key, existing);
        });
      }
    });

    // Panel 1: Skill Distribution by Category
    const categoryCounts: Record<string, number> = {
      Technical: 0,
      Leadership: 0,
      Domain: 0,
      'Soft Skills': 0,
      Compliance: 0,
    };
    allSkills.forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    const skillDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // Panel 2: Required vs Available Skills
    const requiredVsAvailable = allSkills.slice(0, 10).map((s) => {
      const stats = skillCountMap.get(s.name.toLowerCase()) || { available: 0, certified: 0, totalRating: 0 };
      return {
        skill: s.name,
        category: s.category,
        required: s.requiredHeadcount || 5,
        available: stats.available,
      };
    });

    // Panel 3: Skill Gaps
    const skillGaps = allSkills
      .map((s) => {
        const stats = skillCountMap.get(s.name.toLowerCase()) || { available: 0, certified: 0, totalRating: 0 };
        const required = s.requiredHeadcount || 5;
        const gap = Math.max(0, required - stats.available);
        const gapPercentage = required > 0 ? Math.round((gap / required) * 100) : 0;
        return {
          id: s._id,
          name: s.name,
          category: s.category,
          required,
          available: stats.available,
          gap,
          gapPercentage,
          status: gap === 0 ? 'Optimal' : gap <= 2 ? 'Moderate' : 'Critical',
        };
      })
      .sort((a, b) => b.gap - a.gap);

    // Panel 4: Department Skill Coverage
    const departments = await Department.find({ isActive: true }).lean();
    const departmentSkillCoverage = departments.map((dept) => {
      const deptEmployees = allEmployees.filter((e) => String(e.departmentId) === String(dept._id));
      const deptSkills = allSkills.filter((s) =>
        s.departmentIds?.some((dId) => String(dId) === String(dept._id))
      );

      const targetRequired = deptSkills.reduce((acc, curr) => acc + (curr.requiredHeadcount || 5), 0);
      const totalAvailable = deptEmployees.reduce(
        (acc, curr) => acc + (curr.skills?.length || 0),
        0
      );

      const coverageRate =
        targetRequired > 0
          ? Math.min(100, Math.round((totalAvailable / targetRequired) * 100))
          : Math.min(100, deptEmployees.length * 15);

      return {
        department: dept.name,
        code: dept.code,
        coverageRate,
        employeeCount: deptEmployees.length,
      };
    });

    // Panel 5: Top and Missing Skills
    const sortedByAvailable = [...allSkills].sort((a, b) => {
      const aAvail = skillCountMap.get(a.name.toLowerCase())?.available || 0;
      const bAvail = skillCountMap.get(b.name.toLowerCase())?.available || 0;
      return bAvail - aAvail;
    });

    const topSkills = sortedByAvailable.slice(0, 5).map((s) => ({
      name: s.name,
      category: s.category,
      availableEmployees: skillCountMap.get(s.name.toLowerCase())?.available || 0,
    }));

    const missingSkills = skillGaps
      .filter((g) => g.gap > 0)
      .slice(0, 5)
      .map((g) => ({
        name: g.name,
        category: g.category,
        gap: g.gap,
        priority: g.status,
      }));

    // Panel 6: Certification Status
    const certificationStatus = {
      totalAssessed: totalAssessedSkills,
      certifiedCount: totalCertifications,
      uncertifiedCount: Math.max(0, totalAssessedSkills - totalCertifications),
      certificationRate:
        totalAssessedSkills > 0
          ? Math.round((totalCertifications / totalAssessedSkills) * 100)
          : 0,
    };

    // Panel 7: Training Recommendations
    const activeTrainings = await Training.find({ isActive: true })
      .populate('targetSkillId', 'name category')
      .limit(6)
      .lean();

    const trainingRecommendations = activeTrainings.map((t: any) => ({
      id: t._id,
      title: t.title,
      category: t.category,
      targetSkill: t.targetSkillId?.name || 'General Competency',
      durationHours: t.durationHours,
      provider: t.provider,
      difficulty: t.difficulty,
      enrolledCount: t.enrolledEmployees?.length || 0,
      completionRate:
        t.enrolledEmployees?.length > 0
          ? Math.round(((t.completedEmployees?.length || 0) / t.enrolledEmployees.length) * 100)
          : 85,
    }));

    res.status(200).json({
      success: true,
      data: {
        skillDistribution,
        requiredVsAvailable,
        skillGaps,
        departmentSkillCoverage,
        topSkills,
        missingSkills,
        certificationStatus,
        trainingRecommendations,
      },
    });
  } catch (error: any) {
    console.error('Error in getSkillAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve skill analytics',
      error: error.message,
    });
  }
};
