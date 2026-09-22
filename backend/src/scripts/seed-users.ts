import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, UserRole } from '../models/user.model';

interface SeedUserData {
  username: string;
  displayName: string;
  email: string;
  password: string;
  roles: UserRole[];
  department: string;
}

const SEED_USERS: SeedUserData[] = [
  {
    username: 'admin',
    displayName: 'System Admin',
    email: 'admin@wfa.internal',
    password: 'Password123!',
    roles: ['admin'],
    department: 'Executive Management',
  },
  {
    username: 'hr',
    displayName: 'Sarah HR',
    email: 'hr@wfa.internal',
    password: 'Password123!',
    roles: ['manager'],
    department: 'Human Resources',
  },
  {
    username: 'manager',
    displayName: 'Marcus Manager',
    email: 'manager@wfa.internal',
    password: 'Password123!',
    roles: ['manager'],
    department: 'Engineering',
  },
  {
    username: 'employee',
    displayName: 'Alex Employee',
    email: 'employee@wfa.internal',
    password: 'Password123!',
    roles: ['employee'],
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
        existing.roles = userData.roles;
        existing.username = userData.username;
        existing.displayName = userData.displayName;
        await existing.save();
        console.log(`ℹ️ User updated: ${userData.email} (Roles: ${userData.roles.join(', ')})`);
      } else {
        await User.create(userData);
        console.log(`✅ Created ${userData.username}: ${userData.email}`);
      }
    }

    console.log('\n🎉 Enterprise accounts seeded successfully!');
    console.log('🔑 Default password for all accounts: Password123!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedUsers();
