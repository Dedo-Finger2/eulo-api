import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../../utils/query.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const removeProductFromStorage = Router();

/**
 * @swagger
 * /api/v1/storages/{publicId}/products/{productPublicId}/remove:
 *  patch:
 *    summary: Remove a product from a storage
 *    description: Remove a product from a user's storage.
 *    tags: [Storages]
 *    parameters:
 *      - in: path
 *        name: publicId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The public ID of the storage
 *        example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *      - in: path
 *        name: productPublicId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The public ID of the product to be removed from the storage
 *        example: c9b1d7fa-2c46-4ae8-a9ed-89d1d7fae8b9
 *    responses:
 *      200:
 *        description: Successfully removed the product from the storage.
 *      400:
 *        description: Bad request. The product is not in the storage.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Product is not in storage."
 *      404:
 *        description: Not found. Either the storage or the product was not found.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Storage not found. or Product not found."
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

removeProductFromStorage.patch(
  "/api/v1/storages/:publicId/products/:productPublicId/remove",
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

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!storage[0])
        return response.status(404).send({ message: "Storage not found." });

      const product = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [productPublicId, userId],
      );

      if (!product[0])
        return response.status(404).send({ message: "Product not found." });

      const isProductInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      if (!isProductInStorage[0])
        return response
          .status(400)
          .send({ message: "Product is not in storage." });

      await queryDatabase(
        "DELETE FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { removeProductFromStorage };
