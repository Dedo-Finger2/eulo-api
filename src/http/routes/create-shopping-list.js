import { Router } from "express";
import { queryDatabase } from "../../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { randomUUID } from "node:crypto";

const createShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists:
 *   post:
 *     summary: Create a new shopping list
 *     description: Creates a new shopping list for the authenticated user.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       201:
 *         description: Shopping list successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:
 *                   type: string
 *                   description: The public ID of the created shopping list.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       500:
 *         description: Error on creating a new shopping list. Try again later.
 *       default:
 *         description: Error processing the request.
 */

createShoppingList.post(
  "/api/v1/shopping-lists",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const publicId = randomUUID();

      await queryDatabase(
        "INSERT INTO shopping_lists (public_id, user_id) VALUES ($1, $2)",
        [publicId, userId],
      );

      return response.status(201).send({ publicId });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createShoppingList };
