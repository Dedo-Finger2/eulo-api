import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { randomUUID } from "node:crypto";

const createStorage = Router();

/**
 * @swagger
 * /api/v1/storages:
 *   post:
 *     summary: Create a new storage
 *     description: Creates a new storage for the authenticated user if they don't already have one.
 *     tags: [Storages]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       201:
 *         description: Storage successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:
 *                   type: string
 *                   description: The public ID of the created storage.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: You already have a storage.
 *       500:
 *         description: Error on creating a new storage. Try again later.
 *       default:
 *         description: Error processing the request.
 */

createStorage.post(
  "/api/v1/storages",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const doesUserAlreadyHasAStorage = await queryDatabase(
        "SELECT * FROM storages WHERE user_id = $1",
        [userId],
      );

      if (doesUserAlreadyHasAStorage[0])
        return response
          .status(400)
          .send({ message: "You already have a storage." });

      const publicId = randomUUID();

      await queryDatabase(
        "INSERT INTO storages (public_id, user_id) VALUES ($1, $2)",
        [publicId, userId],
      );

      return response.status(201).send({ publicId });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createStorage };
