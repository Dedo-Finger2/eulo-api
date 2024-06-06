import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../../utils/query.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const removeProductFromShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}/products/{productPublicId}/remove:
 *  patch:
 *    summary: Remove a product from a shopping list
 *    description: Remove a product from a shopping list if the shopping list is not completed.
 *    tags: [Shopping Lists]
 *    parameters:
 *      - in: path
 *        name: publicId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The public ID of the shopping list
 *        example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *      - in: path
 *        name: productPublicId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The public ID of the product to be removed
 *        example: c9b1d7fa-2c46-4ae8-a9ed-89d1d7fae8b9
 *    responses:
 *      200:
 *        description: Successfully removed the product from the shopping list.
 *      400:
 *        description: Bad request. Either the shopping list is completed or the product is not in the shopping list.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Cannot remove product from completed shopping list or Product is not in shoppingList."
 *      404:
 *        description: Not found. Either the shopping list or the product was not found.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Shopping List not found or Product not found."
 *      500:
 *        description: Internal server error.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Internal server error."
 */

removeProductFromShoppingList.patch(
  "/api/v1/shopping-lists/:publicId/products/:productPublicId/remove",
  verifyAuthCookie,
  async (request, response) => {
    const cookieSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
      productPublicId: string().uuid().required(),
    });

    try {
      const { userId } = await cookieSchema.validate(request.cookies);
      const { publicId, productPublicId } = await requestParamsSchema.validate(
        request.params,
      );

      const shoppingList = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!shoppingList[0])
        return response
          .status(404)
          .send({ message: "Shopping List not found." });

      const isShoppingListCompleted = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2 AND completed_at IS NOT NULL",
        [publicId, userId],
      );

      if (isShoppingListCompleted[0])
        return response.status(400).send({
          message: "Cannot remove product from completed shopping list.",
        });

      const product = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [productPublicId, userId],
      );

      if (!product[0])
        return response.status(404).send({ message: "Product not found." });

      const isProductInShoppingList = await queryDatabase(
        "SELECT * FROM shopping_list_products WHERE shopping_list_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      if (!isProductInShoppingList[0])
        return response
          .status(400)
          .send({ message: "Product is not in shoppingList." });

      await queryDatabase(
        "DELETE FROM shopping_list_products WHERE shopping_list_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { removeProductFromShoppingList };
