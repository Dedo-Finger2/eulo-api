import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";

const createUnitType = Router();

createUnitType.post(
  "/api/v1/unitTypes",
  verifyAuthCookie,
  async (request, response) => {
    const requestBodySchema = object({
      name: string().required().min(1).max(4),
      description: string().optional(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { name, description } = await requestBodySchema.validate(
        request.body,
      );
      const { userId } = await cookiesSchema.validate(request.cookies);

      const doesUnitTypeAlreadyExists = await queryDatabase(
        "SELECT * FROM unit_types WHERE name = $1 AND user_id = $2",
        [name, userId],
      );

      if (doesUnitTypeAlreadyExists.length > 0 && doesUnitTypeAlreadyExists)
        return response.status(400).send({ message: "Name already in use." });

      const publicId = randomUUID();

      const createdUnitType = await queryDatabase(
        "INSERT INTO unit_types (public_id, name, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [publicId, name, description, userId],
      );

      if (!createdUnitType)
        return response.status(500).send({
          message: "Error on creating a new unitType. Try again later.",
        });

      return response.status(201).send({ message: createdUnitType.public_id });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createUnitType };
