import { PostgreSqlConnection } from "../../../config/database/postgres.js";
import { MissingParameterError } from "../../../errors";
import { QueryBuilder } from "../../../utils/query.js";
import { UserRepository } from "../../user-repository.js";
import { OutputUserDto } from "../../../domain/dto/user-dto.js";

export class PostgresUserRepository extends UserRepository {
  queryBuilder = null;

  constructor() {
    super();
  }

  async initQueryBuilder() {
    const connection = await PostgreSqlConnection.getConnection();

    this.queryBuilder = new QueryBuilder(connection);
  }

  async save({ publicId, name, email, createdAt, updatedAt }) {
    await this.initQueryBuilder();

    if (!this.queryBuilder) {
      throw new Error("Query builder not initialized.");
    }

    const missingParams = [];
    if (!publicId) missingParams.push("publicId");
    if (!name) missingParams.push("name");
    if (!email) missingParams.push("email");
    if (!createdAt) missingParams.push("createdAt");
    if (!updatedAt) missingParams.push("updatedAt");

    if (missingParams.length)
      throw new MissingParameterError({ parameters: missingParams });

    const createdUser = await this.queryBuilder.query({
      sqlStmt: "INSERT INTO users (public_id, name, email) VALUES ($1, $2, $3)",
      params: [publicId, name, email],
      options: { first: true },
    });

    const outputUserDto = new OutputUserDto({
      id: createdUser.id,
      publicId: createdUser.public_id,
      name: createdUser.name,
      email: createdUser.email,
      createdAt: createdUser.created_at,
      updatedAt: createdUser.updated_at,
    });

    return outputUserDto;
  }
}
