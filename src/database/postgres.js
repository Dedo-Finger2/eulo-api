import pg from "pg";
import { env } from "../utils/env.js";

const { Pool } = pg;

const pool = new Pool({
  user: env.DB_PG_USER,
  host: env.DB_PG_HOST,
  database: env.DB_PG_DATABASE,
  password: env.DB_PG_PASSWORD,
  port: env.DB_PG_PORT,
});

export class PostgreSqlConnection {
  static _connection;

  static async getConnection() {
    if (!PostgreSqlConnection._connection) {
      PostgreSqlConnection._connection = await pool.connect();
    }

    return PostgreSqlConnection._connection;
  }
}
