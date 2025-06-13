import mongoose from 'mongoose';

let instance = null;

export const getConnection = () => {
  if (!instance) {
    instance = mongoose.createConnection();
  }
  return instance;
};

export const closeConnection = async () => {
  if (instance) {
    await instance.close();
    instance = null;
  }
};