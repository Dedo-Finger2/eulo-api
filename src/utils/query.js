import { MissingParameterError } from "../errors";

export class QueryBuilder {
  #connection;

  constructor(connection) {
    if (!connection)
      throw new MissingParameterError({ parameters: ["connection"] });

    this.#connection = connection;
  }

  async query({ sqlStmt, params, options }) {
    if (!sqlStmt) throw new MissingParameterError({ parameters: ["sqlStmt"] });

    try {
      sqlStmt = this.addReturningToInsertAndUpdateQueries({ sqlStmt });

      const client = await this.#connection.connect();

      const { rows } = await client.query(sqlStmt, params);

      client.release();

      return this.handleReturningQuery({ rows, options });
    } catch (error) {
      console.error("Error running the query: ", error);

      throw error;
    }
  }

  handleReturningQuery({ rows, options }) {
    if (options && options.first) return rows[0];

    return rows;
  }

  addReturningToInsertAndUpdateQueries({ sqlStmt }) {
    if (!sqlStmt.includes("SELECT")) return (sqlStmt += " RETURNING *");
  }
}
