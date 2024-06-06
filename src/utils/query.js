import { PostgreSqlConnection } from "../config/database/postgres.js";

export async function queryDatabase(sql, params = []) {
  try {
    const connection = await PostgreSqlConnection.getConnection();

    const response = await connection.query(sql, params);

    return sql.toUpperCase().startsWith("SELECT")
      ? response.rows
      : response.rows[0];
  } catch (error) {
    console.error("Error running the query!", error);
  }
}
