import pg, { DatabaseError } from "pg";
import { env } from "../env.js";
import { Db } from "./db.js";

const { Pool } = pg;

const pool = new Pool({
  user: env.DB_PG_USER,
  host: env.DB_PG_HOST,
  database: env.DB_PG_DATABASE,
  password: env.DB_PG_PASSWORD,
  port: env.DB_PG_PORT,
});

export class PostgreSqlConnection extends Db {
  static _pool = pool;

  static async getConnection() {
    try {
      if (!PostgreSqlConnection._pool) {
        PostgreSqlConnection._pool = new Pool({
          user: env.DB_PG_USER,
          host: env.DB_PG_HOST,
          database: env.DB_PG_DATABASE,
          password: env.DB_PG_PASSWORD,
          port: env.DB_PG_PORT,
        });
      }

      return PostgreSqlConnection._pool;
    } catch (error) {
      console.error(error);

      throw new DatabaseError(error);
    }
  }
}
