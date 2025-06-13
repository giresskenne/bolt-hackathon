import { connect as connectTestDB } from './database.test.js';
import { getConnection } from './database.shared.js';

export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return await connectTestDB();
    }

    const connection = getConnection();
    if (connection.readyState !== 0) {
      console.log('MongoDB already connected');
      return;
    }

    await connection.openUri(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};