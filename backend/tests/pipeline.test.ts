import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { PipelineService } from '../src/services/pipeline.service';
import { Department } from '../src/models/department.model';
import { Employee } from '../src/models/employee.model';
import { Training } from '../src/models/training.model';
import { Skill } from '../src/models/skill.model';
import { Placement } from '../src/models/placement.model';
import { LearningRecord } from '../src/models/learning-record.model';

describe('Sprint 2 Data Pipeline, Deduplication & Mapping Validation Tests', () => {
  let sampleDept: any;
  let sampleEmp: any;
  let sampleTraining: any;
  let sampleSkill: any;

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI as string);

    sampleDept = await Department.findOne({ isActive: true });
    sampleEmp = await Employee.findOne({ isDeleted: { $ne: true } });
    sampleTraining = await Training.findOne({ isActive: true });
    sampleSkill = await Skill.findOne({ isActive: true });

    expect(sampleDept).toBeDefined();
    expect(sampleEmp).toBeDefined();
    expect(sampleTraining).toBeDefined();
    expect(sampleSkill).toBeDefined();
  });

  afterAll(async () => {
    // Clean up test-specific records
    await Placement.deleteMany({ candidateEmail: 'test.pipeline.candidate@unit-test.com' });
    await LearningRecord.deleteMany({ recordId: { $in: ['LR-TEST-001', 'LR-TEST-002'] } });
    await mongoose.disconnect();
  });

  it('1. Deduplication Engine: Prevents duplicate placement candidate for same employer and role', async () => {
    const candidateData = {
      placementId: 'PLC-TEST-DUP-1',
      candidateName: 'Test Duplicate Candidate',
      candidateEmail: 'test.pipeline.candidate@unit-test.com',
      roleTitle: 'Lead Cloud Architect',
      departmentId: sampleDept._id.toString(),
      skills: ['Cloud Infrastructure (AWS/GCP)'],
      employer: 'Unit Test Employer Inc.',
      location: 'San Francisco',
      applicationDate: new Date().toISOString(),
      stage: 'Applied' as const,
      status: 'In Progress' as const,
    };

    // First insertion should succeed
    const res1 = await PipelineService.processPlacements([candidateData]);
    expect(res1.inserted).toBe(1);
    expect(res1.duplicatesSkipped).toBe(0);

    // Second insertion with same email, employer, and role (different placementId) should be flagged as DUPLICATE
    const res2 = await PipelineService.processPlacements([
      {
        ...candidateData,
        placementId: 'PLC-TEST-DUP-2',
      },
    ]);
    expect(res2.inserted).toBe(0);
    expect(res2.duplicatesSkipped).toBe(1);
    expect(res2.issues.length).toBe(1);
    expect(res2.issues[0].type).toBe('DUPLICATE_RECORD');
  });

  it('2. Orphan Mapping Engine: Flags invalid or non-existent Department ID', async () => {
    const fakeDeptId = new mongoose.Types.ObjectId().toString();

    const res = await PipelineService.processPlacements([
      {
        placementId: 'PLC-TEST-ORPHAN-1',
        candidateName: 'Orphan Candidate',
        candidateEmail: 'orphan.candidate@unit-test.com',
        roleTitle: 'Software Engineer',
        departmentId: fakeDeptId,
        skills: ['React.js'],
        employer: 'Acme Test Corp',
        location: 'New York',
        applicationDate: new Date().toISOString(),
        stage: 'Applied' as const,
        status: 'In Progress' as const,
      },
    ]);

    expect(res.inserted).toBe(0);
    expect(res.invalidMappings).toBe(1);
    expect(res.issues.length).toBe(1);
    expect(res.issues[0].type).toBe('MISSING_DEPARTMENT');
  });

  it('3. Orphan Mapping Engine: Flags invalid or non-existent Employee ID in Learning Records', async () => {
    const fakeEmpId = new mongoose.Types.ObjectId().toString();

    const res = await PipelineService.processLearningRecords([
      {
        recordId: 'LR-TEST-001',
        employeeId: fakeEmpId,
        trainingId: sampleTraining._id.toString(),
        targetSkillId: sampleSkill._id.toString(),
        departmentId: sampleDept._id.toString(),
        status: 'Enrolled' as const,
        enrolmentDate: new Date().toISOString(),
        progressPct: 0,
        hoursSpent: 0,
        passedAssessment: false,
        certificationEarned: false,
      },
    ]);

    expect(res.inserted).toBe(0);
    expect(res.invalidMappings).toBe(1);
    expect(res.issues.length).toBe(1);
    expect(res.issues[0].type).toBe('MISSING_EMPLOYEE');
  });

  it('4. Learning Deduplication: Prevents double-enrolling the same employee in the same training course', async () => {
    const learningData = {
      recordId: 'LR-TEST-002',
      employeeId: sampleEmp._id.toString(),
      trainingId: sampleTraining._id.toString(),
      targetSkillId: sampleSkill._id.toString(),
      departmentId: sampleDept._id.toString(),
      status: 'Enrolled' as const,
      enrolmentDate: new Date().toISOString(),
      progressPct: 10,
      hoursSpent: 2,
      passedAssessment: false,
      certificationEarned: false,
    };

    // Clean any prior enrolment for this test employee & training
    await LearningRecord.deleteMany({ employeeId: sampleEmp._id, trainingId: sampleTraining._id });

    // First enrolment should insert
    const res1 = await PipelineService.processLearningRecords([learningData]);
    expect(res1.inserted).toBe(1);
    expect(res1.duplicatesSkipped).toBe(0);

    // Second enrolment attempt with different recordId should be skipped as DUPLICATE
    const res2 = await PipelineService.processLearningRecords([
      {
        ...learningData,
        recordId: 'LR-TEST-003',
      },
    ]);
    expect(res2.inserted).toBe(0);
    expect(res2.duplicatesSkipped).toBe(1);
    expect(res2.issues[0].type).toBe('DUPLICATE_RECORD');
  });

  it('5. Database Audit Health Check: Audits current database for orphaned mappings', async () => {
    const report = await PipelineService.auditDatabase();

    expect(report).toBeDefined();
    expect(typeof report.orphanPlacements).toBe('number');
    expect(typeof report.orphanLearningRecords).toBe('number');
    expect(report.orphanPlacements).toBe(0);
    expect(report.orphanLearningRecords).toBe(0);
    expect(report.healthy).toBe(true);
  });
});
