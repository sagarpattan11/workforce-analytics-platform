import mongooseConnection from 'mongoose';
import { env } from '../config/env';
import { Department } from '../models/department.model';
import { Team } from '../models/team.model';
import { Employee } from '../models/employee.model';
import { Role } from '../models/role.model';
import { Location } from '../models/location.model';
import { Skill } from '../models/skill.model';
import { Training } from '../models/training.model';
import { Recruitment } from '../models/recruitment.model';
import { Placement } from '../models/placement.model';
import { Attendance } from '../models/attendance.model';
import { Performance } from '../models/performance.model';

const seedWorkforce = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas for workforce seeding...');
    await mongooseConnection.connect(env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB Atlas');

    // -------------------------------------------------------------
    // 1. SEED DEPARTMENTS
    // -------------------------------------------------------------
    console.log('🏢 Seeding Departments...');
    const departmentsData = [
      { name: 'Engineering', code: 'ENG', description: 'Software engineering, architecture, and infrastructure' },
      { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee relations, and culture' },
      { name: 'Finance', code: 'FIN', description: 'Financial planning, accounting, and payroll' },
      { name: 'Marketing', code: 'MKT', description: 'Growth marketing, brand awareness, and communications' },
      { name: 'Operations', code: 'OPS', description: 'Business operations, facilities, and supply chain' },
      { name: 'Product & Design', code: 'PROD', description: 'Product management and UI/UX experience design' },
    ];

    const departmentMap = new Map<string, any>();
    for (const d of departmentsData) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) {
        dept = await Department.create(d);
        console.log(`   + Created department: ${dept.name} (${dept.code})`);
      } else {
        console.log(`   * Department exists: ${dept.name} (${dept.code})`);
      }
      departmentMap.set(d.code, dept);
    }

    // -------------------------------------------------------------
    // 2. SEED TEAMS
    // -------------------------------------------------------------
    console.log('\n🤝 Seeding Teams...');
    const teamsData = [
      { name: 'Frontend Engineering', code: 'FE', deptCode: 'ENG', description: 'Web & mobile user interface engineering' },
      { name: 'Backend Engineering', code: 'BE', deptCode: 'ENG', description: 'Distributed microservices and database architecture' },
      { name: 'DevOps & Cloud', code: 'DEVOPS', deptCode: 'ENG', description: 'Kubernetes, AWS/GCP, and CI/CD automation' },
      { name: 'Quality Assurance', code: 'QA', deptCode: 'ENG', description: 'Automated testing and release validation' },
      { name: 'Talent Acquisition', code: 'TA', deptCode: 'HR', description: 'Recruiting, interviewing, and executive search' },
      { name: 'People Operations', code: 'PO', deptCode: 'HR', description: 'Onboarding, benefits, and workplace experience' },
      { name: 'Financial Planning & Analysis', code: 'FPNA', deptCode: 'FIN', description: 'Budget forecasting and fiscal reporting' },
      { name: 'Corporate Accounting', code: 'ACC', deptCode: 'FIN', description: 'General ledger, tax compliance, and payroll' },
      { name: 'Growth Marketing', code: 'GROWTH', deptCode: 'MKT', description: 'User acquisition, SEO, and paid performance' },
      { name: 'Brand & Content', code: 'BRAND', deptCode: 'MKT', description: 'Corporate branding, design, and PR' },
      { name: 'Platform Operations', code: 'PLAT', deptCode: 'OPS', description: 'Enterprise workflows and system logistics' },
      { name: 'Product Design', code: 'DESIGN', deptCode: 'PROD', description: 'UI/UX wireframing, design systems, and user research' },
    ];

    const teamMap = new Map<string, any>();
    for (const t of teamsData) {
      const dept = departmentMap.get(t.deptCode);
      if (!dept) continue;

      let team = await Team.findOne({ departmentId: dept._id, code: t.code });
      if (!team) {
        team = await Team.create({
          name: t.name,
          code: t.code,
          departmentId: dept._id,
          description: t.description,
        });
        console.log(`   + Created team: ${team.name} (${team.code}) in ${dept.name}`);
      } else {
        console.log(`   * Team exists: ${team.name} (${team.code}) in ${dept.name}`);
      }
      teamMap.set(t.code, team);
    }

    // -------------------------------------------------------------
    // 3. SEED LOCATIONS
    // -------------------------------------------------------------
    console.log('\n📍 Seeding Locations...');
    const locationsData = [
      { name: 'HQ - San Francisco', code: 'HQ-SF', city: 'San Francisco', country: 'United States', type: 'Office', capacity: 250 },
      { name: 'New York Innovation Hub', code: 'NY-HUB', city: 'New York', country: 'United States', type: 'Office', capacity: 150 },
      { name: 'London Tech Center', code: 'LDN-CTR', city: 'London', country: 'United Kingdom', type: 'Hybrid', capacity: 100 },
      { name: 'Berlin Engineering Lab', code: 'BER-LAB', city: 'Berlin', country: 'Germany', type: 'Office', capacity: 80 },
      { name: 'Tokyo Regional Hub', code: 'TKO-HUB', city: 'Tokyo', country: 'Japan', type: 'Office', capacity: 60 },
      { name: 'Global Remote Workforce', code: 'REM-GLB', city: 'Remote', country: 'Global', type: 'Work From Home', capacity: 500 },
    ];

    for (const loc of locationsData) {
      await Location.findOneAndUpdate({ code: loc.code }, loc, { upsert: true, new: true });
    }
    console.log(`   + Seeded ${locationsData.length} Enterprise Locations`);

    // -------------------------------------------------------------
    // 4. SEED ROLES
    // -------------------------------------------------------------
    console.log('\n👔 Seeding Roles...');
    const engDept = departmentMap.get('ENG');
    const hrDept = departmentMap.get('HR');
    const prodDept = departmentMap.get('PROD');
    const finDept = departmentMap.get('FIN');

    const rolesData = [
      { name: 'Staff Software Engineer', code: 'ENG-STAFF', departmentId: engDept._id, level: 'Lead', description: 'Technical direction & architecture' },
      { name: 'Senior Software Engineer', code: 'ENG-SR-SWE', departmentId: engDept._id, level: 'Senior', description: 'Full stack feature engineering' },
      { name: 'DevOps & Cloud Architect', code: 'ENG-DEVOPS', departmentId: engDept._id, level: 'Senior', description: 'Infrastructure and pipelines' },
      { name: 'QA Automation Engineer', code: 'ENG-QA', departmentId: engDept._id, level: 'Mid', description: 'Test automation and quality gates' },
      { name: 'HR Business Partner', code: 'HR-BP', departmentId: hrDept._id, level: 'Senior', description: 'Strategic talent management' },
      { name: 'Talent Acquisition Specialist', code: 'HR-TAS', departmentId: hrDept._id, level: 'Mid', description: 'Candidate sourcing and interview coordination' },
      { name: 'Lead Product Manager', code: 'PROD-LEAD', departmentId: prodDept._id, level: 'Lead', description: 'Product roadmapping and delivery' },
      { name: 'Senior UI/UX Designer', code: 'PROD-DESIGN', departmentId: prodDept._id, level: 'Senior', description: 'Design systems and UX research' },
      { name: 'Financial Planning Analyst', code: 'FIN-ANALYST', departmentId: finDept._id, level: 'Mid', description: 'Budget forecasting and fiscal reporting' },
    ];

    for (const r of rolesData) {
      await Role.findOneAndUpdate({ code: r.code }, r, { upsert: true, new: true });
    }
    console.log(`   + Seeded ${rolesData.length} Roles`);

    // -------------------------------------------------------------
    // 5. SEED SKILLS
    // -------------------------------------------------------------
    console.log('\n🧠 Seeding Skills Registry...');
    const skillsData = [
      { name: 'React.js & Next.js', category: 'Technical', requiredHeadcount: 12, benchmarkScore: 85, departmentIds: [engDept._id] },
      { name: 'Node.js & TypeScript', category: 'Technical', requiredHeadcount: 10, benchmarkScore: 80, departmentIds: [engDept._id] },
      { name: 'Cloud Architecture & AWS', category: 'Technical', requiredHeadcount: 8, benchmarkScore: 85, departmentIds: [engDept._id] },
      { name: 'PostgreSQL & MongoDB', category: 'Technical', requiredHeadcount: 9, benchmarkScore: 80, departmentIds: [engDept._id] },
      { name: 'Docker & Kubernetes', category: 'Technical', requiredHeadcount: 7, benchmarkScore: 75, departmentIds: [engDept._id] },
      { name: 'Agile & Scrum Leadership', category: 'Leadership', requiredHeadcount: 10, benchmarkScore: 90, departmentIds: [engDept._id, prodDept._id] },
      { name: 'Executive Communication', category: 'Soft Skills', requiredHeadcount: 14, benchmarkScore: 85, departmentIds: [hrDept._id, prodDept._id] },
      { name: 'Talent Acquisition & Sourcing', category: 'Domain', requiredHeadcount: 6, benchmarkScore: 85, departmentIds: [hrDept._id] },
      { name: 'Financial Modeling & Forecasting', category: 'Domain', requiredHeadcount: 5, benchmarkScore: 90, departmentIds: [finDept._id] },
      { name: 'Design Systems & Figma', category: 'Domain', requiredHeadcount: 6, benchmarkScore: 85, departmentIds: [prodDept._id] },
      { name: 'SOC2 & GDPR Data Compliance', category: 'Compliance', requiredHeadcount: 8, benchmarkScore: 95, departmentIds: [engDept._id, hrDept._id] },
    ];

    const skillMap = new Map<string, any>();
    for (const s of skillsData) {
      const savedSkill = await Skill.findOneAndUpdate({ name: s.name }, s, { upsert: true, new: true });
      skillMap.set(s.name, savedSkill);
    }
    console.log(`   + Seeded ${skillsData.length} Skills`);

    // -------------------------------------------------------------
    // 6. SEED RECRUITMENT (Open Positions KPI)
    // -------------------------------------------------------------
    console.log('\n📢 Seeding Recruitment Requisitions (Open Positions)...');
    const requisitionsData = [
      { requisitionNumber: 'REQ-2026-001', title: 'Senior Full Stack Engineer', departmentId: engDept._id, location: 'San Francisco', openPositions: 3, filledPositions: 1, priority: 'High', status: 'Open' },
      { requisitionNumber: 'REQ-2026-002', title: 'DevOps / SRE Lead', departmentId: engDept._id, location: 'London', openPositions: 2, filledPositions: 0, priority: 'Critical', status: 'Interviewing' },
      { requisitionNumber: 'REQ-2026-003', title: 'Senior Product Designer', departmentId: prodDept._id, location: 'Remote', openPositions: 2, filledPositions: 0, priority: 'Medium', status: 'Open' },
      { requisitionNumber: 'REQ-2026-004', title: 'Technical Recruiter', departmentId: hrDept._id, location: 'New York', openPositions: 2, filledPositions: 1, priority: 'Medium', status: 'Interviewing' },
      { requisitionNumber: 'REQ-2026-005', title: 'FP&A Senior Analyst', departmentId: finDept._id, location: 'New York', openPositions: 2, filledPositions: 0, priority: 'High', status: 'Open' },
      { requisitionNumber: 'REQ-2026-006', title: 'Staff Data Engineer', departmentId: engDept._id, location: 'San Francisco', openPositions: 2, filledPositions: 0, priority: 'High', status: 'Open' },
    ];

    for (const req of requisitionsData) {
      await Recruitment.findOneAndUpdate({ requisitionNumber: req.requisitionNumber }, req, { upsert: true, new: true });
    }
    console.log(`   + Seeded ${requisitionsData.length} Recruitment Open Positions`);

    // -------------------------------------------------------------
    // 7. SEED TRAINING CATALOG
    // -------------------------------------------------------------
    console.log('\n🎓 Seeding Training Catalog...');
    const trainingsData = [
      {
        title: 'Enterprise React & State Management Masterclass',
        category: 'Technical',
        targetSkillId: skillMap.get('React.js & Next.js')?._id,
        durationHours: 24,
        provider: 'Frontend Masters',
        difficulty: 'Advanced',
        rating: 4.9,
        isActive: true,
      },
      {
        title: 'Cloud Architecture & Kubernetes in Production',
        category: 'Technical',
        targetSkillId: skillMap.get('Docker & Kubernetes')?._id,
        durationHours: 32,
        provider: 'Cloud Native Computing Foundation',
        difficulty: 'Advanced',
        rating: 4.8,
        isActive: true,
      },
      {
        title: 'Modern Agile Leadership & Team Coaching',
        category: 'Leadership',
        targetSkillId: skillMap.get('Agile & Scrum Leadership')?._id,
        durationHours: 16,
        provider: 'Scrum Alliance',
        difficulty: 'Intermediate',
        rating: 4.7,
        isActive: true,
      },
      {
        title: 'Strategic Talent Sourcing & DEI Best Practices',
        category: 'Domain',
        targetSkillId: skillMap.get('Talent Acquisition & Sourcing')?._id,
        durationHours: 12,
        provider: 'SHRM Academy',
        difficulty: 'Intermediate',
        rating: 4.8,
        isActive: true,
      },
    ];

    for (const tr of trainingsData) {
      await Training.findOneAndUpdate({ title: tr.title }, tr, { upsert: true, new: true });
    }
    console.log(`   + Seeded ${trainingsData.length} Training Courses`);

    // -------------------------------------------------------------
    // 8. SEED EMPLOYEES (With Skills, Experience & Exits)
    // -------------------------------------------------------------
    console.log('\n👥 Seeding Enriched Employees...');
    const now = new Date();
    const getRelativeDate = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const employeesData = [
      // Engineering - Frontend
      {
        employeeId: 'EMP-1001',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@workforce.internal',
        phone: '+1 (555) 234-5678',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Staff Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(340),
        yearsOfExperience: 8,
        salary: 155000,
        skills: [
          { name: 'React.js & Next.js', proficiency: 'Expert', certified: true },
          { name: 'Node.js & TypeScript', proficiency: 'Advanced', certified: true },
          { name: 'Agile & Scrum Leadership', proficiency: 'Advanced', certified: false },
        ],
      },
      {
        employeeId: 'EMP-1002',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera@workforce.internal',
        phone: '+1 (555) 345-6789',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        workLocationType: 'Hybrid',
        hireDate: getRelativeDate(280),
        yearsOfExperience: 6,
        salary: 135000,
        skills: [
          { name: 'React.js & Next.js', proficiency: 'Advanced', certified: true },
          { name: 'Node.js & TypeScript', proficiency: 'Intermediate', certified: false },
        ],
      },
      {
        employeeId: 'EMP-1003',
        firstName: 'Liam',
        lastName: 'Davies',
        email: 'liam.davies@workforce.internal',
        phone: '+44 20 7946 0912',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'London',
        workLocationType: 'Hybrid',
        hireDate: getRelativeDate(18), // New hire (< 30 days)
        yearsOfExperience: 3,
        salary: 85000,
        skills: [
          { name: 'React.js & Next.js', proficiency: 'Intermediate', certified: false },
        ],
      },
      {
        employeeId: 'EMP-1004',
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: 'ananya.sharma@workforce.internal',
        phone: '+1 (555) 456-7890',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(190),
        yearsOfExperience: 4,
        salary: 120000,
        skills: [
          { name: 'React.js & Next.js', proficiency: 'Advanced', certified: true },
          { name: 'Design Systems & Figma', proficiency: 'Intermediate', certified: false },
        ],
      },
      // Engineering - Backend
      {
        employeeId: 'EMP-1005',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@workforce.internal',
        phone: '+1 (555) 567-8901',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Staff Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(420),
        yearsOfExperience: 11,
        salary: 160000,
        skills: [
          { name: 'Node.js & TypeScript', proficiency: 'Expert', certified: true },
          { name: 'PostgreSQL & MongoDB', proficiency: 'Expert', certified: true },
          { name: 'Cloud Architecture & AWS', proficiency: 'Advanced', certified: true },
        ],
      },
      {
        employeeId: 'EMP-1006',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@workforce.internal',
        phone: '+49 30 123456',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'Berlin',
        workLocationType: 'Office',
        hireDate: getRelativeDate(310),
        yearsOfExperience: 7,
        salary: 110000,
        skills: [
          { name: 'Node.js & TypeScript', proficiency: 'Advanced', certified: true },
          { name: 'PostgreSQL & MongoDB', proficiency: 'Advanced', certified: false },
        ],
      },
      {
        employeeId: 'EMP-1007',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@workforce.internal',
        phone: '+1 (555) 678-9012',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        workLocationType: 'Hybrid',
        hireDate: getRelativeDate(14), // New hire (< 30 days)
        yearsOfExperience: 2,
        salary: 95000,
        skills: [
          { name: 'Node.js & TypeScript', proficiency: 'Intermediate', certified: false },
        ],
      },
      // Engineering - DevOps
      {
        employeeId: 'EMP-1008',
        firstName: 'Rajesh',
        lastName: 'Patel',
        email: 'rajesh.patel@workforce.internal',
        phone: '+1 (555) 789-0123',
        deptCode: 'ENG',
        teamCode: 'DEVOPS',
        position: 'DevOps & Cloud Architect',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(500),
        yearsOfExperience: 10,
        salary: 165000,
        skills: [
          { name: 'Cloud Architecture & AWS', proficiency: 'Expert', certified: true },
          { name: 'Docker & Kubernetes', proficiency: 'Expert', certified: true },
          { name: 'SOC2 & GDPR Data Compliance', proficiency: 'Advanced', certified: true },
        ],
      },
      // HR Team
      {
        employeeId: 'EMP-1011',
        firstName: 'Jessica',
        lastName: 'Taylor',
        email: 'jessica.taylor@workforce.internal',
        phone: '+1 (555) 012-3456',
        deptCode: 'HR',
        teamCode: 'TA',
        position: 'HR Business Partner',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(365),
        yearsOfExperience: 8,
        salary: 115000,
        skills: [
          { name: 'Talent Acquisition & Sourcing', proficiency: 'Expert', certified: true },
          { name: 'Executive Communication', proficiency: 'Expert', certified: true },
        ],
      },
      {
        employeeId: 'EMP-1012',
        firstName: 'Michael',
        lastName: 'Chang',
        email: 'michael.chang@workforce.internal',
        phone: '+1 (555) 123-4567',
        deptCode: 'HR',
        teamCode: 'TA',
        position: 'Talent Acquisition Specialist',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        workLocationType: 'Office',
        hireDate: getRelativeDate(200),
        yearsOfExperience: 4,
        salary: 82000,
        skills: [
          { name: 'Talent Acquisition & Sourcing', proficiency: 'Advanced', certified: false },
        ],
      },
      // Product & Design
      {
        employeeId: 'EMP-1025',
        firstName: 'Lucas',
        lastName: 'Mendoza',
        email: 'lucas.mendoza@workforce.internal',
        phone: '+1 (555) 456-7892',
        deptCode: 'PROD',
        teamCode: 'DESIGN',
        position: 'Lead Product Manager',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(400),
        yearsOfExperience: 9,
        salary: 150000,
        skills: [
          { name: 'Agile & Scrum Leadership', proficiency: 'Expert', certified: true },
          { name: 'Executive Communication', proficiency: 'Expert', certified: false },
        ],
      },
      {
        employeeId: 'EMP-1026',
        firstName: 'Aria',
        lastName: 'Sterling',
        email: 'aria.sterling@workforce.internal',
        phone: '+1 (555) 567-8903',
        deptCode: 'PROD',
        teamCode: 'DESIGN',
        position: 'Senior UI/UX Designer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        workLocationType: 'Hybrid',
        hireDate: getRelativeDate(220),
        yearsOfExperience: 5,
        salary: 125000,
        skills: [
          { name: 'Design Systems & Figma', proficiency: 'Expert', certified: true },
        ],
      },
      // Finance
      {
        employeeId: 'EMP-1015',
        firstName: 'Thomas',
        lastName: 'Wright',
        email: 'thomas.wright@workforce.internal',
        phone: '+1 (555) 456-7891',
        deptCode: 'FIN',
        teamCode: 'FPNA',
        position: 'Financial Planning Analyst',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        workLocationType: 'Office',
        hireDate: getRelativeDate(300),
        yearsOfExperience: 5,
        salary: 110000,
        skills: [
          { name: 'Financial Modeling & Forecasting', proficiency: 'Advanced', certified: true },
        ],
      },
      // Exited Employees (Terminated) to power Exits KPI and Attrition Rate
      {
        employeeId: 'EMP-1031',
        firstName: 'Jordan',
        lastName: 'Bell',
        email: 'jordan.bell@workforce.internal',
        phone: '+1 (555) 888-9991',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Senior Software Engineer',
        employmentType: 'Full-time',
        status: 'Terminated',
        location: 'San Francisco',
        workLocationType: 'Office',
        hireDate: getRelativeDate(450),
        exitDate: getRelativeDate(25),
        exitReason: 'Career Advancement',
        yearsOfExperience: 5,
        salary: 130000,
        skills: [
          { name: 'React.js & Next.js', proficiency: 'Advanced', certified: true },
        ],
      },
      {
        employeeId: 'EMP-1032',
        firstName: 'Chloe',
        lastName: 'Bennett',
        email: 'chloe.bennett@workforce.internal',
        phone: '+1 (555) 888-9992',
        deptCode: 'MKT',
        teamCode: 'GROWTH',
        position: 'Growth Marketing Lead',
        employmentType: 'Full-time',
        status: 'Terminated',
        location: 'Remote',
        workLocationType: 'Work From Home',
        hireDate: getRelativeDate(380),
        exitDate: getRelativeDate(40),
        exitReason: 'Relocation',
        yearsOfExperience: 4,
        salary: 115000,
        skills: [
          { name: 'Executive Communication', proficiency: 'Intermediate', certified: false },
        ],
      },
    ];

    const seededEmployees = [];
    for (const emp of employeesData) {
      const dept = departmentMap.get(emp.deptCode);
      const team = teamMap.get(emp.teamCode);
      if (!dept) continue;

      const empPayload = {
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        departmentId: dept._id,
        teamId: team?._id || null,
        position: emp.position,
        employmentType: emp.employmentType as any,
        status: emp.status as any,
        location: emp.location,
        workLocationType: emp.workLocationType as any,
        hireDate: emp.hireDate,
        exitDate: (emp as any).exitDate || null,
        exitReason: (emp as any).exitReason || undefined,
        yearsOfExperience: emp.yearsOfExperience || 3,
        skills: emp.skills || [],
        salary: emp.salary,
        isDeleted: false,
      };

      const saved = await Employee.findOneAndUpdate(
        { employeeId: emp.employeeId },
        empPayload,
        { upsert: true, new: true }
      );
      seededEmployees.push(saved);
      console.log(`   + Seeded: ${emp.firstName} ${emp.lastName} (${emp.position}) - ${emp.status}`);
    }

    // -------------------------------------------------------------
    // 9. SEED ATTENDANCE RECORDS
    // -------------------------------------------------------------
    console.log('\n📅 Seeding Attendance Records...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const emp of seededEmployees.slice(0, 10)) {
      if (emp.status === 'Active') {
        const checkIn = new Date(today);
        checkIn.setHours(9, Math.floor(Math.random() * 20), 0);
        await Attendance.findOneAndUpdate(
          { employeeId: emp._id, date: today },
          {
            employeeId: emp._id,
            date: today,
            checkIn,
            status: 'Present',
            workLocation: emp.workLocationType || 'Office',
            hoursWorked: 8,
          },
          { upsert: true }
        );
      }
    }
    console.log('   + Seeded Attendance for Active Employees');

    // -------------------------------------------------------------
    // 10. SEED PERFORMANCE REVIEWS
    // -------------------------------------------------------------
    console.log('\n⭐ Seeding Performance Appraisals...');
    for (const emp of seededEmployees.slice(0, 8)) {
      await Performance.findOneAndUpdate(
        { employeeId: emp._id, reviewPeriod: '2026-Q1' },
        {
          employeeId: emp._id,
          reviewPeriod: '2026-Q1',
          rating: 4 + Math.random() * 0.9,
          goals: ['Deliver core platform features', 'Mentor team members'],
          goalsAchievedRate: 95,
          feedback: 'Exceptional performance and proactive collaboration.',
          status: 'Approved',
        },
        { upsert: true }
      );
    }
    console.log('   + Seeded Performance Appraisals');

    // -------------------------------------------------------------
    // 11. SEED PLACEMENTS
    // -------------------------------------------------------------
    console.log('\n🚀 Seeding Placements...');
    for (const emp of seededEmployees.slice(0, 5)) {
      await Placement.findOneAndUpdate(
        { employeeId: emp._id },
        {
          placementId: `PLC-${emp.employeeId}`,
          employeeId: emp._id,
          departmentId: emp.departmentId,
          teamId: emp.teamId,
          location: emp.location,
          placementDate: emp.hireDate,
          status: 'Confirmed',
        },
        { upsert: true }
      );
    }
    console.log('   + Seeded Placements');

    console.log('\n🎉 ALL 12 SPRINT 1 WORKFORCE DATA COLLECTIONS SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedWorkforce();
