import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnection, closeConnection } from './database.shared.js';

let mongod = null;

export const connect = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const connection = getConnection();
    await connection.openUri(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to in-memory test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    await closeConnection();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
  } catch (error) {
    console.error('Error closing test database:', error);
    throw error;
  }
};

export const clearDatabase = async () => {
  const connection = getConnection();
  if (!connection.readyState) return;
  
  const collections = connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};