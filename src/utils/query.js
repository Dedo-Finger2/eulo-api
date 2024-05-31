import { PostgreSqlConnection } from "../database/postgres.js";

/** @param {string} sql  */
export async function queryDatabase(sql) {
  try {
    const connection = await PostgreSqlConnection.getConnection();

    const response = await connection.query(sql);

    return sql.toUpperCase().startsWith("SELECT")
      ? response.rows
      : response.rows[0];
  } catch (error) {
    console.error("Error running the query!", error);
  }
}
