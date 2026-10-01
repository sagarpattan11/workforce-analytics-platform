import mongoose from 'mongoose';
import { env } from '../config/env';
import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model';
import { Skill } from '../models/skill.model';
import { Training } from '../models/training.model';
import { Placement } from '../models/placement.model';
import { Recruitment } from '../models/recruitment.model';
import { LearningRecord } from '../models/learning-record.model';

const seedSprint2 = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas for Sprint 2 data seeding...');
    await mongoose.connect(env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Fetch Existing Foundation Data
    const departments = await Department.find({ isActive: true });
    const employees = await Employee.find({ isDeleted: { $ne: true } });
    const skills = await Skill.find({ isActive: true });

    if (!departments.length || !employees.length || !skills.length) {
      throw new Error('Prerequisite foundation data missing. Please ensure departments, employees, and skills exist.');
    }

    const deptMap = new Map(departments.map((d) => [d.code, d]));
    const skillMap = new Map(skills.map((s) => [s.name, s]));

    console.log(`Found ${departments.length} departments, ${employees.length} employees, and ${skills.length} skills.`);

    // =========================================================================
    // 2. SEED ENHANCED TRAINING CATALOG
    // =========================================================================
    console.log('\n📚 Seeding Training Courses for Learning Analytics...');
    const trainingsData = [
      {
        title: 'Kubernetes, Cloud Native & Docker Mastery',
        category: 'Technical',
        description: 'Container orchestration, CI/CD pipelines, and microservices scaling on AWS/GCP.',
        targetSkillName: 'DevOps & CI/CD Pipelines',
        durationHours: 32,
        provider: 'Cloud Native Foundation',
        difficulty: 'Advanced',
        rating: 4.9,
      },
      {
        title: 'React 18 Architecture & Performance Optimization',
        category: 'Technical',
        description: 'Advanced state patterns, server components, and enterprise component architecture.',
        targetSkillName: 'React.js & Next.js',
        durationHours: 24,
        provider: 'Frontend Masters Academy',
        difficulty: 'Advanced',
        rating: 4.8,
      },
      {
        title: 'Enterprise Python & Distributed Data Engineering',
        category: 'Technical',
        description: 'Data pipelines, asynchronous processing, and API design with Python 3.12.',
        targetSkillName: 'Python Backend & Data Analysis',
        durationHours: 28,
        provider: 'DataCamp Enterprise',
        difficulty: 'Intermediate',
        rating: 4.7,
      },
      {
        title: 'Cloud Infrastructure & AWS Solutions Architecture',
        category: 'Technical',
        description: 'VPC design, IAM governance, security hardening, and disaster recovery architectures.',
        targetSkillName: 'Cloud Infrastructure (AWS/GCP)',
        durationHours: 36,
        provider: 'AWS Training Partner',
        difficulty: 'Advanced',
        rating: 4.9,
      },
      {
        title: 'Strategic Engineering Leadership & People Management',
        category: 'Leadership',
        description: 'Effective 1-on-1s, engineering culture, performance appraisals, and conflict resolution.',
        targetSkillName: 'Technical Leadership & Mentoring',
        durationHours: 16,
        provider: 'Executive Leadership Institute',
        difficulty: 'Intermediate',
        rating: 4.9,
      },
      {
        title: 'Executive Communication & Business Storytelling',
        category: 'Soft Skills',
        description: 'Translating technical complexity into executive summaries and client presentations.',
        targetSkillName: 'Executive Communication',
        durationHours: 12,
        provider: 'Global Talent Institute',
        difficulty: 'Beginner',
        rating: 4.6,
      },
      {
        title: 'Enterprise Financial Modeling & Risk Forecasting',
        category: 'Domain',
        description: 'DCF valuation, variance analysis, and scenario modeling for SaaS financial planners.',
        targetSkillName: 'Financial Modeling & Forecasting',
        durationHours: 20,
        provider: 'CFA Institute Partner',
        difficulty: 'Advanced',
        rating: 4.8,
      },
      {
        title: 'GDPR, SOC2 & Global Cybersecurity Compliance',
        category: 'Compliance',
        description: 'Statutory compliance, data handling regulations, access control, and incident reporting.',
        targetSkillName: 'DevOps & CI/CD Pipelines', // or generic technical
        durationHours: 8,
        provider: 'InfoSec Compliance Academy',
        difficulty: 'Beginner',
        rating: 4.7,
      },
    ];

    const seededTrainings = [];
    for (const t of trainingsData) {
      const targetSkill = skillMap.get(t.targetSkillName) || skills[0];
      const training = await Training.findOneAndUpdate(
        { title: t.title },
        {
          title: t.title,
          category: t.category,
          description: t.description,
          targetSkillId: targetSkill._id,
          durationHours: t.durationHours,
          provider: t.provider,
          difficulty: t.difficulty,
          rating: t.rating,
          isActive: true,
        },
        { upsert: true, new: true }
      );
      seededTrainings.push(training);
      console.log(`   + Training: ${training.title} (${training.category})`);
    }

    // =========================================================================
    // 3. SEED LEARNING RECORDS (ENROLMENTS, ASSESSMENTS, CERTIFICATIONS)
    // =========================================================================
    console.log('\n🎓 Seeding Learning Records & Assessment Scores...');
    await LearningRecord.deleteMany({}); // Reset for pristine seed

    const learningRecordsPayload = [];
    let recordCounter = 1000;

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      // Assign 1 to 2 courses per employee
      const assignedTraining1 = seededTrainings[i % seededTrainings.length];
      const assignedTraining2 = seededTrainings[(i + 3) % seededTrainings.length];

      // Course 1: mostly completed
      const score1 = 70 + Math.floor(Math.random() * 28); // 70 - 98
      const passed1 = score1 >= 75;
      recordCounter++;
      learningRecordsPayload.push({
        recordId: `LR-${recordCounter}`,
        employeeId: emp._id,
        trainingId: assignedTraining1._id,
        targetSkillId: assignedTraining1.targetSkillId,
        departmentId: emp.departmentId,
        status: 'Completed',
        enrolmentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        progressPct: 100,
        hoursSpent: assignedTraining1.durationHours,
        assessmentScore: score1,
        passedAssessment: passed1,
        certificationEarned: passed1,
        certificateName: passed1 ? `${assignedTraining1.title} Certified Specialist` : undefined,
        certificateId: passed1 ? `CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
        effectivenessRating: 4.2 + Math.random() * 0.7,
        feedback: 'Course provided clear practical skills directly applicable to active deliverables.',
      });

      // Course 2: In Progress or Enrolled
      if (i % 2 === 0) {
        recordCounter++;
        const isInProgress = i % 4 !== 0;
        const progress = isInProgress ? Math.floor(25 + Math.random() * 60) : 0;
        learningRecordsPayload.push({
          recordId: `LR-${recordCounter}`,
          employeeId: emp._id,
          trainingId: assignedTraining2._id,
          targetSkillId: assignedTraining2.targetSkillId,
          departmentId: emp.departmentId,
          status: isInProgress ? 'In Progress' : 'Enrolled',
          enrolmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          progressPct: progress,
          hoursSpent: Math.round((progress / 100) * assignedTraining2.durationHours),
          assessmentScore: undefined,
          passedAssessment: false,
          certificationEarned: false,
        });
      }
    }

    await LearningRecord.insertMany(learningRecordsPayload);
    console.log(`   + Successfully seeded ${learningRecordsPayload.length} Learning Records`);

    // =========================================================================
    // 4. SEED RECRUITMENT REQUISITIONS & FUNNELS
    // =========================================================================
    console.log('\n💼 Seeding Recruitment Requisitions & Funnels...');
    await Recruitment.deleteMany({}); // Clean reset

    const engDept = deptMap.get('ENG') || departments[0];
    const hrDept = deptMap.get('HR') || departments[1];
    const finDept = deptMap.get('FIN') || departments[2];
    const mktDept = deptMap.get('MKT') || departments[3];
    const prodDept = deptMap.get('PROD') || departments[0];

    const recruitmentRequisitions = [
      {
        requisitionNumber: 'REQ-2026-001',
        title: 'Senior Cloud Platform Architect',
        departmentId: engDept._id,
        location: 'San Francisco',
        openPositions: 2,
        filledPositions: 2,
        applicationsCount: 88,
        shortlistedCount: 24,
        interviewedCount: 12,
        offersCount: 3,
        hiresCount: 2,
        timeToHireDays: 28,
        costPerHire: 4600,
        offerAcceptanceRate: 85.0,
        sourcingChannel: 'LinkedIn',
        skillsRequired: ['Cloud Infrastructure (AWS/GCP)', 'DevOps & CI/CD Pipelines'],
        priority: 'Critical',
        status: 'Closed',
      },
      {
        requisitionNumber: 'REQ-2026-002',
        title: 'Full Stack React & Node Engineer',
        departmentId: engDept._id,
        location: 'New York',
        openPositions: 4,
        filledPositions: 3,
        applicationsCount: 142,
        shortlistedCount: 38,
        interviewedCount: 18,
        offersCount: 4,
        hiresCount: 3,
        timeToHireDays: 24,
        costPerHire: 3800,
        offerAcceptanceRate: 88.0,
        sourcingChannel: 'Referral',
        skillsRequired: ['React.js & Next.js', 'Node.js & Microservices'],
        priority: 'High',
        status: 'Interviewing',
      },
      {
        requisitionNumber: 'REQ-2026-003',
        title: 'Lead DevOps & Security Engineer',
        departmentId: engDept._id,
        location: 'London',
        openPositions: 1,
        filledPositions: 1,
        applicationsCount: 52,
        shortlistedCount: 14,
        interviewedCount: 6,
        offersCount: 1,
        hiresCount: 1,
        timeToHireDays: 32,
        costPerHire: 5100,
        offerAcceptanceRate: 100.0,
        sourcingChannel: 'LinkedIn',
        skillsRequired: ['DevOps & CI/CD Pipelines'],
        priority: 'High',
        status: 'Closed',
      },
      {
        requisitionNumber: 'REQ-2026-004',
        title: 'Global Talent Acquisition Partner',
        departmentId: hrDept._id,
        location: 'San Francisco',
        openPositions: 2,
        filledPositions: 1,
        applicationsCount: 65,
        shortlistedCount: 18,
        interviewedCount: 8,
        offersCount: 2,
        hiresCount: 1,
        timeToHireDays: 21,
        costPerHire: 2900,
        offerAcceptanceRate: 75.0,
        sourcingChannel: 'Career Portal',
        skillsRequired: ['Executive Communication'],
        priority: 'Medium',
        status: 'Interviewing',
      },
      {
        requisitionNumber: 'REQ-2026-005',
        title: 'Senior Financial Planning Analyst',
        departmentId: finDept._id,
        location: 'New York',
        openPositions: 1,
        filledPositions: 1,
        applicationsCount: 48,
        shortlistedCount: 15,
        interviewedCount: 7,
        offersCount: 1,
        hiresCount: 1,
        timeToHireDays: 26,
        costPerHire: 3500,
        offerAcceptanceRate: 100.0,
        sourcingChannel: 'Referral',
        skillsRequired: ['Financial Modeling & Forecasting'],
        priority: 'Medium',
        status: 'Closed',
      },
      {
        requisitionNumber: 'REQ-2026-006',
        title: 'Growth Marketing & Demand Generation Lead',
        departmentId: mktDept._id,
        location: 'Remote',
        openPositions: 2,
        filledPositions: 2,
        applicationsCount: 110,
        shortlistedCount: 28,
        interviewedCount: 11,
        offersCount: 2,
        hiresCount: 2,
        timeToHireDays: 22,
        costPerHire: 3200,
        offerAcceptanceRate: 92.0,
        sourcingChannel: 'Agency',
        skillsRequired: ['Executive Communication'],
        priority: 'Medium',
        status: 'Closed',
      },
      {
        requisitionNumber: 'REQ-2026-007',
        title: 'Staff Product Experience Designer',
        departmentId: prodDept._id,
        location: 'San Francisco',
        openPositions: 1,
        filledPositions: 0,
        applicationsCount: 74,
        shortlistedCount: 19,
        interviewedCount: 9,
        offersCount: 1,
        hiresCount: 0,
        timeToHireDays: 34,
        costPerHire: 4900,
        offerAcceptanceRate: 70.0,
        sourcingChannel: 'LinkedIn',
        skillsRequired: ['Product Design System', 'Executive Communication'],
        priority: 'Critical',
        status: 'Offer Sent',
      },
      {
        requisitionNumber: 'REQ-2026-008',
        title: 'Junior Backend & API Developer',
        departmentId: engDept._id,
        location: 'Berlin',
        openPositions: 3,
        filledPositions: 1,
        applicationsCount: 160,
        shortlistedCount: 42,
        interviewedCount: 15,
        offersCount: 2,
        hiresCount: 1,
        timeToHireDays: 19,
        costPerHire: 2400,
        offerAcceptanceRate: 80.0,
        sourcingChannel: 'Campus',
        skillsRequired: ['Node.js & Microservices', 'Python Backend & Data Analysis'],
        priority: 'Low',
        status: 'Interviewing',
      },
    ];

    await Recruitment.insertMany(recruitmentRequisitions);
    console.log(`   + Successfully seeded ${recruitmentRequisitions.length} Recruitment Requisitions`);

    // =========================================================================
    // 5. SEED PLACEMENT RECORDS (CANDIDATE FUNNELS & SALARIES)
    // =========================================================================
    console.log('\n🎯 Seeding Placement Candidates & Funnels...');
    await Placement.deleteMany({}); // Clean reset

    const employers = [
      'TechCorp Global',
      'Acme Cloud Solutions',
      'FinTech Innovations',
      'Apex Data Labs',
      'Nexus Health Tech',
      'Vanguard Logistics',
      'Starlight Media Group',
      'CyberSecure Inc.',
    ];

    const candidates = [
      { name: 'Marcus Vance', email: 'marcus.vance@candidate.io', role: 'Staff Cloud Architect', dept: engDept, loc: 'San Francisco', employer: 'TechCorp Global', skills: ['Cloud Infrastructure (AWS/GCP)', 'DevOps & CI/CD Pipelines'], salary: 175000, bonus: 25000, stage: 'Placed', status: 'Placed', days: 25 },
      { name: 'Elena Rostova', email: 'elena.rostova@candidate.io', role: 'Senior React Developer', dept: engDept, loc: 'New York', employer: 'Acme Cloud Solutions', skills: ['React.js & Next.js', 'Node.js & Microservices'], salary: 145000, bonus: 15000, stage: 'Placed', status: 'Placed', days: 22 },
      { name: 'Kavita Patel', email: 'kavita.patel@candidate.io', role: 'DevOps Lead', dept: engDept, loc: 'London', employer: 'TechCorp Global', skills: ['DevOps & CI/CD Pipelines'], salary: 155000, bonus: 18000, stage: 'Placed', status: 'Placed', days: 30 },
      { name: 'Liam O’Connor', email: 'liam.oconnor@candidate.io', role: 'Financial Planning Specialist', dept: finDept, loc: 'New York', employer: 'FinTech Innovations', skills: ['Financial Modeling & Forecasting'], salary: 120000, bonus: 12000, stage: 'Placed', status: 'Placed', days: 19 },
      { name: 'Aaliyah Khan', email: 'aaliyah.khan@candidate.io', role: 'Lead Growth Marketer', dept: mktDept, loc: 'Remote', employer: 'Apex Data Labs', skills: ['Executive Communication'], salary: 128000, bonus: 14000, stage: 'Placed', status: 'Placed', days: 21 },
      { name: 'David Cho', email: 'david.cho@candidate.io', role: 'Senior UX/UI Designer', dept: prodDept, loc: 'San Francisco', employer: 'Starlight Media Group', skills: ['Executive Communication'], salary: 135000, bonus: 10000, stage: 'Placed', status: 'Placed', days: 27 },
      { name: 'Sophie Martin', email: 'sophie.martin@candidate.io', role: 'Talent Acquisition Partner', dept: hrDept, loc: 'San Francisco', employer: 'TechCorp Global', skills: ['Executive Communication'], salary: 105000, bonus: 8000, stage: 'Placed', status: 'Placed', days: 18 },
      { name: 'Carlos Gomez', email: 'carlos.gomez@candidate.io', role: 'Kubernetes Platform Engineer', dept: engDept, loc: 'Berlin', employer: 'Nexus Health Tech', skills: ['DevOps & CI/CD Pipelines'], salary: 138000, bonus: 12000, stage: 'Placed', status: 'Placed', days: 29 },
      { name: 'Priya Sharma', email: 'priya.sharma@candidate.io', role: 'Backend Data Engineer', dept: engDept, loc: 'San Francisco', employer: 'Apex Data Labs', skills: ['Python Backend & Data Analysis', 'Node.js & Microservices'], salary: 150000, bonus: 15000, stage: 'Placed', status: 'Placed', days: 26 },
      { name: 'Julian Reed', email: 'julian.reed@candidate.io', role: 'Cybersecurity Analyst', dept: engDept, loc: 'New York', employer: 'CyberSecure Inc.', skills: ['DevOps & CI/CD Pipelines'], salary: 140000, bonus: 14000, stage: 'Placed', status: 'Placed', days: 34 },
      // Candidates currently in the Funnel (Offered, Interviewed, Screened, Applied)
      { name: 'Amara Nwosu', email: 'amara.nwosu@candidate.io', role: 'Cloud Engineer', dept: engDept, loc: 'San Francisco', employer: 'TechCorp Global', skills: ['Cloud Infrastructure (AWS/GCP)'], salary: 148000, bonus: 12000, stage: 'Offered', status: 'In Progress', days: 20 },
      { name: 'Hiroshi Tanaka', email: 'hiroshi.tanaka@candidate.io', role: 'Senior React Developer', dept: engDept, loc: 'Tokyo', employer: 'Acme Cloud Solutions', skills: ['React.js & Next.js'], salary: 132000, bonus: 10000, stage: 'Offered', status: 'In Progress', days: 18 },
      { name: 'Rachel Green', email: 'rachel.green@candidate.io', role: 'FP&A Analyst', dept: finDept, loc: 'London', employer: 'FinTech Innovations', skills: ['Financial Modeling & Forecasting'], salary: 115000, bonus: 9000, stage: 'Interviewed', status: 'In Progress', days: 14 },
      { name: 'Brian Miller', email: 'brian.miller@candidate.io', role: 'Technical Lead', dept: engDept, loc: 'Berlin', employer: 'Nexus Health Tech', skills: ['Technical Leadership & Mentoring'], salary: 165000, bonus: 20000, stage: 'Interviewed', status: 'In Progress', days: 15 },
      { name: 'Nina Petrov', email: 'nina.petrov@candidate.io', role: 'Growth Specialist', dept: mktDept, loc: 'Remote', employer: 'Starlight Media Group', skills: ['Executive Communication'], salary: 110000, bonus: 8000, stage: 'Screened', status: 'In Progress', days: 8 },
      { name: 'Tariq Al-Mansoor', email: 'tariq.almansoor@candidate.io', role: 'Product Designer', dept: prodDept, loc: 'San Francisco', employer: 'Apex Data Labs', skills: ['Executive Communication'], salary: 125000, bonus: 10000, stage: 'Screened', status: 'In Progress', days: 7 },
      { name: 'Zoe Campbell', email: 'zoe.campbell@candidate.io', role: 'Junior Python Developer', dept: engDept, loc: 'New York', employer: 'Vanguard Logistics', skills: ['Python Backend & Data Analysis'], salary: 95000, bonus: 5000, stage: 'Applied', status: 'In Progress', days: 3 },
      { name: 'Derrick Hall', email: 'derrick.hall@candidate.io', role: 'DevOps Specialist', dept: engDept, loc: 'London', employer: 'CyberSecure Inc.', skills: ['DevOps & CI/CD Pipelines'], salary: 135000, bonus: 10000, stage: 'Applied', status: 'In Progress', days: 2 },
      { name: 'Fiona Gallagher', email: 'fiona.gallagher@candidate.io', role: 'Recruiter', dept: hrDept, loc: 'San Francisco', employer: 'TechCorp Global', skills: ['Executive Communication'], salary: 98000, bonus: 6000, stage: 'Withdrawn', status: 'Failed', days: 16 },
      { name: 'Siddharth Roy', email: 'siddharth.roy@candidate.io', role: 'Cloud Architect', dept: engDept, loc: 'Berlin', employer: 'Acme Cloud Solutions', skills: ['Cloud Infrastructure (AWS/GCP)'], salary: 160000, bonus: 15000, stage: 'Rejected', status: 'Failed', days: 12 },
    ];

    const placementsPayload = candidates.map((c, idx) => {
      const appDate = new Date(Date.now() - (c.days + 10) * 24 * 60 * 60 * 1000);
      const placeDate = c.stage === 'Placed' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : undefined;
      return {
        placementId: `PLC-2026-${(100 + idx).toString()}`,
        candidateName: c.name,
        candidateEmail: c.email,
        roleTitle: c.role,
        departmentId: c.dept._id,
        skills: c.skills,
        employer: c.employer,
        location: c.loc,
        applicationDate: appDate,
        placementDate: placeDate,
        daysToPlace: c.days,
        salary: {
          baseSalary: c.salary,
          bonus: c.bonus,
          currency: 'INR',
        },
        stage: c.stage,
        status: c.status,
      };
    });

    await Placement.insertMany(placementsPayload);
    console.log(`   + Successfully seeded ${placementsPayload.length} Placement Records`);

    console.log('\n🎉 SPRINT 2 FOUNDATION & SAMPLE DATA SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sprint 2 seeding failed:', error);
    process.exit(1);
  }
};

seedSprint2();
