// Mock shared database configuration for tests
let connection = null;

export const getConnection = () => {
  return connection;
};

export const setConnection = (conn) => {
  connection = conn;
};