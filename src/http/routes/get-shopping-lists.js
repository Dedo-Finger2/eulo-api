import { Router } from "express";
import { queryDatabase } from "../../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const getShoppingLists = Router();

/**
 * @swagger
 * /api/v1/shopping-lists:
 *   get:
 *     summary: Get all shopping lists for the authenticated user
 *     description: Retrieves all shopping lists associated with the authenticated user.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Shopping lists successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoppingLists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       public_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       completed_at:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: No Shopping List found.
 *       default:
 *         description: Error processing the request.
 */

getShoppingLists.get(
  "/api/v1/shopping-lists",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const shoppingLists = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE user_id = $1",
        [userId],
      );

      if (!shoppingLists)
        return response
          .status(404)
          .send({ message: "No Shopping List found." });

      return response.status(200).send({ shoppingLists });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getShoppingLists };
