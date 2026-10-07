import mongoose from 'mongoose';
import { Placement, IPlacement } from '../models/placement.model';
import { Recruitment, IRecruitment } from '../models/recruitment.model';
import { LearningRecord, ILearningRecord } from '../models/learning-record.model';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { Training } from '../models/training.model';
import { Skill } from '../models/skill.model';
import {
  PlacementIngestInput,
  RecruitmentIngestInput,
  LearningIngestInput,
} from '../validations/pipeline.validation';

export interface PipelineIssue {
  type: 'DUPLICATE_RECORD' | 'MISSING_EMPLOYEE' | 'MISSING_DEPARTMENT' | 'MISSING_TRAINING' | 'MISSING_SKILL' | 'INVALID_DATA';
  identifier: string;
  field?: string;
  value?: any;
  message: string;
}

export interface PipelineSyncSummary {
  placements: {
    processed: number;
    inserted: number;
    updated: number;
    duplicatesSkipped: number;
    invalidMappings: number;
  };
  recruitments: {
    processed: number;
    inserted: number;
    updated: number;
    duplicatesSkipped: number;
    invalidMappings: number;
  };
  learningRecords: {
    processed: number;
    inserted: number;
    updated: number;
    duplicatesSkipped: number;
    invalidMappings: number;
  };
  totalIssues: number;
  issues: PipelineIssue[];
}

export class PipelineService {
  /**
   * Validate that referenced Employee IDs exist and are not soft-deleted
   */
  static async validateEmployeeMapping(employeeId?: string | mongoose.Types.ObjectId | null): Promise<boolean> {
    if (!employeeId) return true; // Optional for external placement candidates
    if (!mongoose.Types.ObjectId.isValid(employeeId.toString())) return false;
    const exists = await Employee.exists({ _id: employeeId, isDeleted: { $ne: true } });
    return Boolean(exists);
  }

  /**
   * Validate that referenced Department ID exists
   */
  static async validateDepartmentMapping(departmentId: string | mongoose.Types.ObjectId): Promise<boolean> {
    if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId.toString())) return false;
    const exists = await Department.exists({ _id: departmentId, isActive: true });
    return Boolean(exists);
  }

  /**
   * Validate that referenced Training ID exists
   */
  static async validateTrainingMapping(trainingId: string | mongoose.Types.ObjectId): Promise<boolean> {
    if (!trainingId || !mongoose.Types.ObjectId.isValid(trainingId.toString())) return false;
    const exists = await Training.exists({ _id: trainingId, isActive: true });
    return Boolean(exists);
  }

  /**
   * Validate that referenced Skill ID exists
   */
  static async validateSkillMapping(skillId: string | mongoose.Types.ObjectId): Promise<boolean> {
    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId.toString())) return false;
    const exists = await Skill.exists({ _id: skillId, isActive: true });
    return Boolean(exists);
  }

  /**
   * Ingest and transform Placement Data with deduplication and mapping checks
   */
  static async processPlacements(
    records: PlacementIngestInput[]
  ): Promise<{ inserted: number; updated: number; duplicatesSkipped: number; invalidMappings: number; issues: PipelineIssue[] }> {
    let inserted = 0;
    let updated = 0;
    let duplicatesSkipped = 0;
    let invalidMappings = 0;
    const issues: PipelineIssue[] = [];

    for (const record of records) {
      // 1. Department Mapping Check
      const validDept = await this.validateDepartmentMapping(record.departmentId);
      if (!validDept) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_DEPARTMENT',
          identifier: record.placementId,
          field: 'departmentId',
          value: record.departmentId,
          message: `Department ID "${record.departmentId}" not found in database.`,
        });
        continue;
      }

      // 2. Employee Mapping Check (if specified)
      if (record.employeeId) {
        const validEmp = await this.validateEmployeeMapping(record.employeeId);
        if (!validEmp) {
          invalidMappings++;
          issues.push({
            type: 'MISSING_EMPLOYEE',
            identifier: record.placementId,
            field: 'employeeId',
            value: record.employeeId,
            message: `Referenced Employee ID "${record.employeeId}" does not exist or has been deleted.`,
          });
          continue;
        }
      }

      // 3. Deduplication Check (by compound key: email + employer + roleTitle)
      const existingDuplicate = await Placement.findOne({
        candidateEmail: record.candidateEmail.toLowerCase(),
        employer: record.employer,
        roleTitle: record.roleTitle,
        placementId: { $ne: record.placementId },
      });

      if (existingDuplicate) {
        duplicatesSkipped++;
        issues.push({
          type: 'DUPLICATE_RECORD',
          identifier: record.placementId,
          message: `Candidate ${record.candidateEmail} already has an active placement record with employer ${record.employer} for role ${record.roleTitle}. Skipping duplicate.`,
        });
        continue;
      }

      // 4. Upsert by placementId
      const existing = await Placement.findOne({ placementId: record.placementId });
      const placementDate = record.placementDate ? new Date(record.placementDate) : undefined;
      const applicationDate = new Date(record.applicationDate);

      // Calculate days to place if not provided and both dates exist
      let daysToPlace = record.daysToPlace;
      if (daysToPlace === undefined && placementDate) {
        const diffMs = placementDate.getTime() - applicationDate.getTime();
        daysToPlace = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }

      const employeeId =
        record.employeeId && mongoose.Types.ObjectId.isValid(record.employeeId)
          ? new mongoose.Types.ObjectId(record.employeeId)
          : undefined;

      const payload: any = {
        ...record,
        employeeId,
        departmentId: new mongoose.Types.ObjectId(record.departmentId),
        applicationDate,
        placementDate,
        daysToPlace,
        candidateEmail: record.candidateEmail.toLowerCase(),
      };

      if (existing) {
        await Placement.updateOne({ _id: existing._id }, { $set: payload });
        updated++;
      } else {
        await Placement.create(payload);
        inserted++;
      }
    }

    return { inserted, updated, duplicatesSkipped, invalidMappings, issues };
  }

  /**
   * Ingest and transform Recruitment Data with deduplication and mapping checks
   */
  static async processRecruitments(
    records: RecruitmentIngestInput[]
  ): Promise<{ inserted: number; updated: number; duplicatesSkipped: number; invalidMappings: number; issues: PipelineIssue[] }> {
    let inserted = 0;
    let updated = 0;
    let duplicatesSkipped = 0;
    let invalidMappings = 0;
    const issues: PipelineIssue[] = [];

    for (const record of records) {
      // 1. Department Mapping Check
      const validDept = await this.validateDepartmentMapping(record.departmentId);
      if (!validDept) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_DEPARTMENT',
          identifier: record.requisitionNumber,
          field: 'departmentId',
          value: record.departmentId,
          message: `Department ID "${record.departmentId}" not found for requisition.`,
        });
        continue;
      }

      // 2. Acceptance rate calculation fallback
      let acceptanceRate = record.offerAcceptanceRate;
      if (record.offersCount > 0 && record.hiresCount >= 0) {
        acceptanceRate = Number(((record.hiresCount / record.offersCount) * 100).toFixed(1));
        if (acceptanceRate > 100) acceptanceRate = 100;
      }

      const payload = {
        ...record,
        offerAcceptanceRate: acceptanceRate,
        targetHireDate: record.targetHireDate ? new Date(record.targetHireDate) : undefined,
      };

      const existing = await Recruitment.findOne({ requisitionNumber: record.requisitionNumber });
      if (existing) {
        await Recruitment.updateOne({ _id: existing._id }, { $set: payload });
        updated++;
      } else {
        await Recruitment.create(payload);
        inserted++;
      }
    }

    return { inserted, updated, duplicatesSkipped, invalidMappings, issues };
  }

  /**
   * Ingest and transform Learning & Assessment Records with deduplication and mapping checks
   */
  static async processLearningRecords(
    records: LearningIngestInput[]
  ): Promise<{ inserted: number; updated: number; duplicatesSkipped: number; invalidMappings: number; issues: PipelineIssue[] }> {
    let inserted = 0;
    let updated = 0;
    let duplicatesSkipped = 0;
    let invalidMappings = 0;
    const issues: PipelineIssue[] = [];

    for (const record of records) {
      // 1. Employee Mapping Check
      const validEmp = await this.validateEmployeeMapping(record.employeeId);
      if (!validEmp) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_EMPLOYEE',
          identifier: record.recordId,
          field: 'employeeId',
          value: record.employeeId,
          message: `Employee ID "${record.employeeId}" does not exist in workforce directory.`,
        });
        continue;
      }

      // 2. Training Course Mapping Check
      const validTraining = await this.validateTrainingMapping(record.trainingId);
      if (!validTraining) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_TRAINING',
          identifier: record.recordId,
          field: 'trainingId',
          value: record.trainingId,
          message: `Training Course ID "${record.trainingId}" does not exist.`,
        });
        continue;
      }

      // 3. Target Skill Mapping Check
      const validSkill = await this.validateSkillMapping(record.targetSkillId);
      if (!validSkill) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_SKILL',
          identifier: record.recordId,
          field: 'targetSkillId',
          value: record.targetSkillId,
          message: `Skill ID "${record.targetSkillId}" does not exist in skill catalog.`,
        });
        continue;
      }

      // 4. Department Mapping Check
      const validDept = await this.validateDepartmentMapping(record.departmentId);
      if (!validDept) {
        invalidMappings++;
        issues.push({
          type: 'MISSING_DEPARTMENT',
          identifier: record.recordId,
          field: 'departmentId',
          value: record.departmentId,
          message: `Department ID "${record.departmentId}" not found for learning record.`,
        });
        continue;
      }

      // 5. Deduplication Check (Compound unique: employeeId + trainingId)
      const duplicateEnrolment = await LearningRecord.findOne({
        employeeId: record.employeeId,
        trainingId: record.trainingId,
        recordId: { $ne: record.recordId },
      });

      if (duplicateEnrolment) {
        duplicatesSkipped++;
        issues.push({
          type: 'DUPLICATE_RECORD',
          identifier: record.recordId,
          message: `Employee already has an active enrolment in training course ${record.trainingId}. Skipping duplicate.`,
        });
        continue;
      }

      // Determine pass/fail & certification
      const score = record.assessmentScore ?? undefined;
      const passed = score !== undefined && score >= 75;
      const certified = record.certificationEarned || passed;

      const payload: any = {
        ...record,
        employeeId: new mongoose.Types.ObjectId(record.employeeId),
        trainingId: new mongoose.Types.ObjectId(record.trainingId),
        targetSkillId: new mongoose.Types.ObjectId(record.targetSkillId),
        departmentId: new mongoose.Types.ObjectId(record.departmentId),
        assessmentScore: score,
        passedAssessment: passed,
        certificationEarned: certified,
        certificateName: record.certificateName || undefined,
        certificateId: record.certificateId || undefined,
        feedback: record.feedback || undefined,
        effectivenessRating: record.effectivenessRating || undefined,
        enrolmentDate: new Date(record.enrolmentDate),
        completionDate: record.completionDate ? new Date(record.completionDate) : undefined,
      };

      const existing = await LearningRecord.findOne({ recordId: record.recordId });
      if (existing) {
        await LearningRecord.updateOne({ _id: existing._id }, { $set: payload });
        updated++;
      } else {
        await LearningRecord.create(payload);
        inserted++;
      }
    }

    return { inserted, updated, duplicatesSkipped, invalidMappings, issues };
  }

  /**
   * Run Database Audit to catch existing orphaned records or duplicates
   */
  static async auditDatabase(): Promise<{
    healthy: boolean;
    orphanPlacements: number;
    orphanLearningRecords: number;
    issues: PipelineIssue[];
  }> {
    const issues: PipelineIssue[] = [];

    // 1. Audit Placements for missing departments or employees (batch query)
    const allPlacements = await Placement.find().select('placementId departmentId employeeId').lean();
    let orphanPlacements = 0;

    const deptIds = [...new Set(allPlacements.map((p) => p.departmentId.toString()))];
    const existingDepts = new Set(
      (await Department.find({ _id: { $in: deptIds } }).select('_id')).map((d) => d._id.toString())
    );

    const empIds = [
      ...new Set(allPlacements.filter((p) => p.employeeId).map((p) => p.employeeId!.toString())),
    ];
    const existingEmps = new Set(
      (await Employee.find({ _id: { $in: empIds }, isDeleted: { $ne: true } }).select('_id')).map((e) =>
        e._id.toString()
      )
    );

    for (const p of allPlacements) {
      if (!existingDepts.has(p.departmentId.toString())) {
        orphanPlacements++;
        issues.push({
          type: 'MISSING_DEPARTMENT',
          identifier: p.placementId,
          field: 'departmentId',
          value: p.departmentId,
          message: `Placement ${p.placementId} references non-existent department ${p.departmentId}.`,
        });
      }

      if (p.employeeId && !existingEmps.has(p.employeeId.toString())) {
        orphanPlacements++;
        issues.push({
          type: 'MISSING_EMPLOYEE',
          identifier: p.placementId,
          field: 'employeeId',
          value: p.employeeId,
          message: `Placement ${p.placementId} references non-existent or soft-deleted employee ${p.employeeId}.`,
        });
      }
    }

    // 2. Audit Learning Records for missing employees, trainings, skills (batch query)
    const allLearning = await LearningRecord.find().select('recordId employeeId trainingId targetSkillId departmentId').lean();
    let orphanLearningRecords = 0;

    const learningEmpIds = [...new Set(allLearning.map((l) => l.employeeId.toString()))];
    const validLearningEmps = new Set(
      (await Employee.find({ _id: { $in: learningEmpIds }, isDeleted: { $ne: true } }).select('_id')).map((e) =>
        e._id.toString()
      )
    );

    const learningTrainingIds = [...new Set(allLearning.map((l) => l.trainingId.toString()))];
    const validTrainings = new Set(
      (await Training.find({ _id: { $in: learningTrainingIds } }).select('_id')).map((t) => t._id.toString())
    );

    const learningSkillIds = [...new Set(allLearning.map((l) => l.targetSkillId.toString()))];
    const validSkills = new Set(
      (await Skill.find({ _id: { $in: learningSkillIds } }).select('_id')).map((s) => s._id.toString())
    );

    for (const l of allLearning) {
      if (!validLearningEmps.has(l.employeeId.toString())) {
        orphanLearningRecords++;
        issues.push({
          type: 'MISSING_EMPLOYEE',
          identifier: l.recordId,
          field: 'employeeId',
          value: l.employeeId,
          message: `Learning record ${l.recordId} references non-existent or deleted employee ${l.employeeId}.`,
        });
      }

      if (!validTrainings.has(l.trainingId.toString())) {
        orphanLearningRecords++;
        issues.push({
          type: 'MISSING_TRAINING',
          identifier: l.recordId,
          field: 'trainingId',
          value: l.trainingId,
          message: `Learning record ${l.recordId} references non-existent training course ${l.trainingId}.`,
        });
      }

      if (!validSkills.has(l.targetSkillId.toString())) {
        orphanLearningRecords++;
        issues.push({
          type: 'MISSING_SKILL',
          identifier: l.recordId,
          field: 'targetSkillId',
          value: l.targetSkillId,
          message: `Learning record ${l.recordId} references non-existent skill ${l.targetSkillId}.`,
        });
      }
    }

    return {
      healthy: issues.length === 0,
      orphanPlacements,
      orphanLearningRecords,
      issues,
    };
  }
}
