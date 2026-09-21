import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, UserRole } from '../models/user.model';

interface SeedUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
}

const SEED_USERS: SeedUserData[] = [
  {
    name: 'System Admin',
    email: 'admin@wfa.internal',
    password: 'Password123!',
    role: 'Admin',
    department: 'Executive Management',
  },
  {
    name: 'Sarah HR',
    email: 'hr@wfa.internal',
    password: 'Password123!',
    role: 'HR Manager',
    department: 'Human Resources',
  },
  {
    name: 'David Executive',
    email: 'exec@wfa.internal',
    password: 'Password123!',
    role: 'Executive',
    department: 'Executive Board',
  },
  {
    name: 'Marcus Manager',
    email: 'manager@wfa.internal',
    password: 'Password123!',
    role: 'Department Manager',
    department: 'Engineering',
  },
  {
    name: 'Elena Lead',
    email: 'lead@wfa.internal',
    password: 'Password123!',
    role: 'Team Lead',
    department: 'Engineering',
  },
  {
    name: 'Alex Employee',
    email: 'employee@wfa.internal',
    password: 'Password123!',
    role: 'Employee',
    department: 'Engineering',
  },
];

const seedUsers = async (): Promise<void> => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas for seeding...');
    await connectDatabase();

    console.log('🌱 Checking and seeding initial enterprise users...');

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`ℹ️ User already exists: ${userData.email} (${existing.role})`);
      } else {
        await User.create(userData);
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      }
    }

    console.log('\n🎉 All 6 enterprise role accounts are seeded successfully!');
    console.log('🔑 Default password for all accounts: Password123!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedUsers();
