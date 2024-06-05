import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const removeProductFromShoppingList = Router();

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
        return response
          .status(400)
          .send({
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
