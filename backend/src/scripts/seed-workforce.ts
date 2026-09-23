import mongooseConnection from 'mongoose';
import { env } from '../config/env';
import { Department } from '../models/department.model';
import { Team } from '../models/team.model';
import { Employee } from '../models/employee.model';

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
    // 3. SEED EMPLOYEES (32 Realistic Employees)
    // -------------------------------------------------------------
    console.log('\n👥 Seeding Employees...');
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
        position: 'Staff Frontend Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        hireDate: getRelativeDate(340),
        salary: 155000,
      },
      {
        employeeId: 'EMP-1002',
        firstName: 'Alex',
        lastName: 'Rivera',
        email: 'alex.rivera@workforce.internal',
        phone: '+1 (555) 345-6789',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Senior React Developer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        hireDate: getRelativeDate(280),
        salary: 135000,
      },
      {
        employeeId: 'EMP-1003',
        firstName: 'Liam',
        lastName: 'Davies',
        email: 'liam.davies@workforce.internal',
        phone: '+44 20 7946 0912',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Frontend Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'London',
        hireDate: getRelativeDate(18), // New hire (< 30 days)
        salary: 85000,
      },
      {
        employeeId: 'EMP-1004',
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: 'ananya.sharma@workforce.internal',
        phone: '+91 80 2345 6789',
        deptCode: 'ENG',
        teamCode: 'FE',
        position: 'Junior UI Engineer',
        employmentType: 'Intern',
        status: 'Active',
        location: 'Bengaluru',
        hireDate: getRelativeDate(10), // New hire (< 30 days)
        salary: 35000,
      },

      // Engineering - Backend
      {
        employeeId: 'EMP-1005',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@workforce.internal',
        phone: '+1 (555) 456-7890',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Principal Backend Architect',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        hireDate: getRelativeDate(360),
        salary: 175000,
      },
      {
        employeeId: 'EMP-1006',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@workforce.internal',
        phone: '+49 30 1234567',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Senior Node.js Developer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'Berlin',
        hireDate: getRelativeDate(210),
        salary: 95000,
      },
      {
        employeeId: 'EMP-1007',
        firstName: 'Karthik',
        lastName: 'Rao',
        email: 'karthik.rao@workforce.internal',
        phone: '+91 80 3456 7890',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Backend Developer',
        employmentType: 'Full-time',
        status: 'On Leave', // On Leave
        location: 'Bengaluru',
        hireDate: getRelativeDate(150),
        salary: 75000,
      },

      // Engineering - DevOps & QA
      {
        employeeId: 'EMP-1008',
        firstName: 'Devon',
        lastName: 'Kim',
        email: 'devon.kim@workforce.internal',
        phone: '+1 (555) 567-8901',
        deptCode: 'ENG',
        teamCode: 'DEVOPS',
        position: 'Lead Cloud Infrastructure Engineer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'Remote',
        hireDate: getRelativeDate(300),
        salary: 145000,
      },
      {
        employeeId: 'EMP-1009',
        firstName: 'Sophia',
        lastName: 'Martinez',
        email: 'sophia.martinez@workforce.internal',
        phone: '+1 (555) 678-9012',
        deptCode: 'ENG',
        teamCode: 'QA',
        position: 'Senior QA Automation Lead',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        hireDate: getRelativeDate(190),
        salary: 110000,
      },

      // Human Resources
      {
        employeeId: 'EMP-1010',
        firstName: 'Rachel',
        lastName: 'Greenfield',
        email: 'rachel.greenfield@workforce.internal',
        phone: '+1 (555) 789-0123',
        deptCode: 'HR',
        teamCode: 'TA',
        position: 'Head of Global Talent Acquisition',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        hireDate: getRelativeDate(320),
        salary: 130000,
      },
      {
        employeeId: 'EMP-1011',
        firstName: 'David',
        lastName: 'O’Connor',
        email: 'david.oconnor@workforce.internal',
        phone: '+44 20 8912 3456',
        deptCode: 'HR',
        teamCode: 'PO',
        position: 'People Operations Manager',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'London',
        hireDate: getRelativeDate(240),
        salary: 80000,
      },
      {
        employeeId: 'EMP-1012',
        firstName: 'Chloe',
        lastName: 'Dupont',
        email: 'chloe.dupont@workforce.internal',
        phone: '+33 1 4050 6070',
        deptCode: 'HR',
        teamCode: 'TA',
        position: 'Technical Recruiter',
        employmentType: 'Contract',
        status: 'Active',
        location: 'Berlin',
        hireDate: getRelativeDate(12), // New hire (< 30 days)
        salary: 60000,
      },

      // Finance
      {
        employeeId: 'EMP-1013',
        firstName: 'Jonathan',
        lastName: 'Sterling',
        email: 'jonathan.sterling@workforce.internal',
        phone: '+1 (555) 890-1234',
        deptCode: 'FIN',
        teamCode: 'FPNA',
        position: 'VP of Financial Planning',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        hireDate: getRelativeDate(350),
        salary: 180000,
      },
      {
        employeeId: 'EMP-1014',
        firstName: 'Priya',
        lastName: 'Nair',
        email: 'priya.nair@workforce.internal',
        phone: '+91 80 4567 8901',
        deptCode: 'FIN',
        teamCode: 'ACC',
        position: 'Senior Corporate Accountant',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'Bengaluru',
        hireDate: getRelativeDate(180),
        salary: 70000,
      },
      {
        employeeId: 'EMP-1015',
        firstName: 'Lucas',
        lastName: 'Schneider',
        email: 'lucas.schneider@workforce.internal',
        phone: '+49 30 8765432',
        deptCode: 'FIN',
        teamCode: 'FPNA',
        position: 'Financial Analyst',
        employmentType: 'Part-time',
        status: 'Active',
        location: 'Berlin',
        hireDate: getRelativeDate(90),
        salary: 45000,
      },

      // Marketing
      {
        employeeId: 'EMP-1016',
        firstName: 'Jessica',
        lastName: 'Alba-Cross',
        email: 'jessica.cross@workforce.internal',
        phone: '+1 (555) 901-2345',
        deptCode: 'MKT',
        teamCode: 'GROWTH',
        position: 'Director of Growth Marketing',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        hireDate: getRelativeDate(270),
        salary: 140000,
      },
      {
        employeeId: 'EMP-1017',
        firstName: 'Oliver',
        lastName: 'Twist-Smith',
        email: 'oliver.smith@workforce.internal',
        phone: '+44 20 7123 4567',
        deptCode: 'MKT',
        teamCode: 'BRAND',
        position: 'Brand & Communications Strategist',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'London',
        hireDate: getRelativeDate(130),
        salary: 78000,
      },
      {
        employeeId: 'EMP-1018',
        firstName: 'Maya',
        lastName: 'Patel',
        email: 'maya.patel@workforce.internal',
        phone: '+1 (555) 012-3456',
        deptCode: 'MKT',
        teamCode: 'GROWTH',
        position: 'SEO & Performance Associate',
        employmentType: 'Full-time',
        status: 'On Leave', // On Leave
        location: 'Remote',
        hireDate: getRelativeDate(25), // New hire (< 30 days)
        salary: 72000,
      },

      // Operations
      {
        employeeId: 'EMP-1019',
        firstName: 'Brandon',
        lastName: 'Hayes',
        email: 'brandon.hayes@workforce.internal',
        phone: '+1 (555) 123-4560',
        deptCode: 'OPS',
        teamCode: 'PLAT',
        position: 'Operations Manager',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'New York',
        hireDate: getRelativeDate(310),
        salary: 115000,
      },
      {
        employeeId: 'EMP-1020',
        firstName: 'Hanna',
        lastName: 'Berg',
        email: 'hanna.berg@workforce.internal',
        phone: '+49 30 9876543',
        deptCode: 'OPS',
        teamCode: 'PLAT',
        position: 'Logistics Coordinator',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'Berlin',
        hireDate: getRelativeDate(160),
        salary: 62000,
      },

      // Product & Design
      {
        employeeId: 'EMP-1021',
        firstName: 'Gabriel',
        lastName: 'Silva',
        email: 'gabriel.silva@workforce.internal',
        phone: '+1 (555) 234-5670',
        deptCode: 'PROD',
        teamCode: 'DESIGN',
        position: 'Head of Product Experience',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'San Francisco',
        hireDate: getRelativeDate(330),
        salary: 160000,
      },
      {
        employeeId: 'EMP-1022',
        firstName: 'Amara',
        lastName: 'Okafor',
        email: 'amara.okafor@workforce.internal',
        phone: '+44 20 8345 6789',
        deptCode: 'PROD',
        teamCode: 'DESIGN',
        position: 'Senior UI/UX Designer',
        employmentType: 'Full-time',
        status: 'Active',
        location: 'London',
        hireDate: getRelativeDate(140),
        salary: 82000,
      },
      {
        employeeId: 'EMP-1023',
        firstName: 'Rohit',
        lastName: 'Verma',
        email: 'rohit.verma@workforce.internal',
        phone: '+91 80 5678 9012',
        deptCode: 'PROD',
        teamCode: 'DESIGN',
        position: 'Product Design Intern',
        employmentType: 'Intern',
        status: 'Active',
        location: 'Bengaluru',
        hireDate: getRelativeDate(8), // New hire (< 30 days)
        salary: 32000,
      },
      {
        employeeId: 'EMP-1024',
        firstName: 'Claire',
        lastName: 'Morrison',
        email: 'claire.morrison@workforce.internal',
        phone: '+1 (555) 345-6781',
        deptCode: 'ENG',
        teamCode: 'BE',
        position: 'Backend Engineer',
        employmentType: 'Full-time',
        status: 'Inactive', // Inactive
        location: 'Remote',
        hireDate: getRelativeDate(220),
        salary: 105000,
      },
    ];

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
        hireDate: emp.hireDate,
        salary: emp.salary,
        isDeleted: false,
      };

      const existing = await Employee.findOne({ employeeId: emp.employeeId });
      if (!existing) {
        await Employee.create(empPayload);
        console.log(`   + Seeded employee: ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${emp.position}`);
      } else {
        await Employee.updateOne({ employeeId: emp.employeeId }, { $set: empPayload });
        console.log(`   * Updated employee: ${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
      }
    }

    console.log('\n🎉 Workforce data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedWorkforce();
