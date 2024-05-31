import { PostgreSqlConnection } from "../database/postgres.js";

export async function queryDatabase(sql) {
  try {
    const connection = await PostgreSqlConnection.getConnection();

    const response = await connection.query(sql);

    return response.rows;
  } catch (error) {
    console.error("Error running the query!", error);
  }
}
