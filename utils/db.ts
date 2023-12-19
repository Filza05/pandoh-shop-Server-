
import { createPool, Pool } from 'mysql2/promise';
import dbConfig from '../DB_Config/db_config';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

let pool: Pool;

export const initializeDatabase = () => {
  pool = createPool(dbConfig);
  console.log("DB INITIALIZEDDDDD")
};

export const getDatabase = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};
