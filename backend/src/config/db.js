import mongoose from 'mongoose';

let isFallbackMode = false;

// In-memory data store for fallback mode
export const memoryDb = {
  users: [],
  rooms: [],
  messages: [],
  orders: [],
  achievements: []
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mochill';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Timeout fast so we can switch to fallback mode
    });
    console.log('✨ [Database] MongoDB connected successfully.');
  } catch (error) {
    isFallbackMode = true;
    console.warn('\n⚠️  [Database] Could not connect to MongoDB.');
    console.warn('⚡ [Database] SWEEPING FALLBACK: Running in-memory database storage mode.');
    console.warn('✨ [Database] This is normal if MongoDB is not running locally. All features will work perfectly!\n');
  }
};

export const getDbMode = () => isFallbackMode;
