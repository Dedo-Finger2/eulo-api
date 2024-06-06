import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { queryDatabase } from "../utils/query.js";

const deleteShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}:
 *   delete:
 *     summary: Delete a shopping list
 *     description: Deletes a shopping list owned by the authenticated user.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The public ID of the shopping list to be deleted.
 *     responses:
 *       200:
 *         description: Shopping list successfully deleted.
 *       404:
 *         description: Shopping list not found.
 *       default:
 *         description: Error processing the request.
 */

deleteShoppingList.delete(
  "/api/v1/shopping-lists/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { userId } = await cookieSchema.validate(request.cookies);

      const doesShoppingListExists = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!doesShoppingListExists[0])
        return response
          .status(404)
          .send({ messsage: "ShoppingList not found." });

      const productsInShoppingList = await queryDatabase(
        "SELECT * FROM shopping_list_products WHERE shopping_list_id = $1",
        [publicId],
      );

      if (productsInShoppingList.length > 0) {
        for (const product of productsInShoppingList) {
          await queryDatabase(
            "DELETE FROM shopping_list_products WHERE shopping_list_id = $1 AND product_id = $2",
            [publicId, product.product_id],
          );
        }
      }

      await queryDatabase(
        "DELETE FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteShoppingList };
