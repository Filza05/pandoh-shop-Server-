import { createPool, Pool } from "mysql2/promise";
import dbConfig from "../DB_Config/db_config";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const pool: Pool = createPool(dbConfig);

export const getDatabase = (): Pool => {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }

  return pool;
};
