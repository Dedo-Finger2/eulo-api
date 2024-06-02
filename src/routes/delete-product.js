import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const deleteProduct = Router();

deleteProduct.delete(
  "/api/v1/products/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { userId } = await cookiesSchema.validate(request.cookies);

      const selectedProduct = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!selectedProduct[0])
        return response.status(404).send({ message: "Product not found." });

      const isProductInUserStorage = await queryDatabase(
        `
        SELECT * FROM storage_products st 
        INNER JOIN products p ON st.product_id = p.public_id
        INNER JOIN storages s ON st.storage_id = s.public_id
        WHERE st.product_id = $1
      `,
        [publicId],
      );

      if (isProductInUserStorage.length > 0)
        return response
          .status(400)
          .send({ message: "Cannot delete this product: In storage." });

      const isProductInUncompletedShoppingList = await queryDatabase(
        `
        SELECT * FROM shopping_list_products slp 
        INNER JOIN products p ON slp.product_id = p.public_id
        INNER JOIN shopping_lists sl ON slp.shopping_list = sl.public_id
        WHERE slp.product_id = $1 AND sl.completed_at IS NULL
      `,
        [publicId],
      );

      if (isProductInUncompletedShoppingList.length > 0)
        return response
          .status(400)
          .send({
            message:
              "Cannot delete this product: In uncompleted shopping list.",
          });

      // TODO: Test if the product is inside a completed shopping list if it will block the deletion

      await queryDatabase(
        "DELETE FROM products WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteProduct };
