import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { number, object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const updateProductQuantityInStorage = Router();

/**
 * @swagger
 * /api/v1/storages/{publicId}/products/{productPublicId}/update-quantity:
 *  patch:
 *    summary: Update quantity of a product in storage
 *    description: Update the quantity of a product in the storage and update its status based on predefined thresholds.
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
 *        description: The public ID of the product
 *        example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *      - in: cookie
 *        name: userId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The user's ID from the cookie
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              newQuantity:
 *                type: number
 *                format: integer
 *                minimum: 1
 *                description: The new quantity of the product in storage
 *                example: 20
 *    responses:
 *      200:
 *        description: Successfully updated the quantity of the product in storage.
 *      400:
 *        description: Bad request. Possible reasons -> product not found, product is not in storage.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Product not found."
 *      404:
 *        description: Not found. The storage was not found.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Storage not found."
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

updateProductQuantityInStorage.patch(
  "/api/v1/storages/:publicId/products/:productPublicId/update-quantity",
  verifyAuthCookie,
  async (request, response) => {
    const requestBodySchema = object({
      newQuantity: number().positive().required().min(1),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
      productPublicId: string().uuid().required(),
    });

    try {
      const { newQuantity } = await requestBodySchema.validate(request.body);
      const { publicId, productPublicId } = await requestParamsSchema.validate(
        request.params,
      );
      const { userId } = await cookiesSchema.validate(request.cookies);

      const product = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [productPublicId, userId],
      );

      if (!product[0])
        return response.status(404).send({ message: "Product not found." });

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!storage[0])
        return response.status(404).send({ messsage: "Storage not found." });

      const isProductInStorage = await queryDatabase(
        "SELECT id FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      if (!isProductInStorage[0])
        return response
          .status(400)
          .send({ message: "Product is not in storage." });

      await queryDatabase(
        "UPDATE storage_products SET quantity = $1 WHERE storage_id = $2 AND product_id = $3",
        [newQuantity, publicId, productPublicId],
      );

      const productQuantityInStorage = await queryDatabase(
        "SELECT quantity FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      let productStatus;

      if (productQuantityInStorage[0].quantity >= product[0].min_quantity + 1) {
        productStatus = "Fine";
      } else if (
        productQuantityInStorage[0].quantity === product[0].min_quantity
      ) {
        productStatus = "Needs Attention";
      } else {
        productStatus = "In Risk";
      }

      await queryDatabase(
        "UPDATE storage_products SET status = $1 WHERE storage_id = $2 AND product_id = $3",
        [productStatus, publicId, productPublicId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { updateProductQuantityInStorage };
