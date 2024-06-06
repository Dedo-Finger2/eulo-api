import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";

const createUnitType = Router();

/**
 * @swagger
 * /api/v1/unitTypes:
 *   post:
 *     summary: Create a new unit type
 *     description: Creates a new unit type for the authenticated user.
 *     tags: [Unit Types]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 4
 *                 description: The name of the unit type.
 *               description:
 *                 type: string
 *                 description: Optional description of the unit type.
 *     responses:
 *       201:
 *         description: Unit type successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The public ID of the created unit type.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: Name already in use.
 *       500:
 *         description: Error on creating a new unit type. Try again later.
 *       default:
 *         description: Error processing the request.
 */

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
