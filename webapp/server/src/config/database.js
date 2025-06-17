import mongoose from 'mongoose';
import { connect as connectTestDB } from './database.test.js';

export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return await connectTestDB();
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-scrubber');
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};