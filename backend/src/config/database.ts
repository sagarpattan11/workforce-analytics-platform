import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined in .env. Running in stateless mode without database persistence.');
    return;
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`✅ MongoDB Atlas connected successfully: ${mongoose.connection.name} (${mongoose.connection.host})`);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    // Don't crash immediately in development, allow inspecting server logs
  }

  // Connection Event Listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection runtime error:', err);
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed.');
  } catch (error) {
    console.error('❌ Error while closing MongoDB connection:', error);
  }
};

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
