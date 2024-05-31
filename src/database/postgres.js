import pg from "pg";

const { Pool } = pg;

const pool = new Pool();

export class PostgreSqlConnection {
  static _connection;

  static async getConnection() {
    if (!PostgreSqlConnection._connection) {
      PostgreSqlConnection._connection = await pool.connect();
    }

    return PostgreSqlConnection._connection;
  }
}
