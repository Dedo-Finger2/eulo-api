import { Router } from "express";
import { number, object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../../utils/query.js";

const updateProduct = Router();

/**
 * @swagger
 * /api/v1/products/{publicId}:
 *  put:
 *    summary: Update product details
 *    description: Update the details of a product.
 *    tags: [Products]
 *    parameters:
 *      - in: path
 *        name: publicId
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
 *              name:
 *                type: string
 *                minLength: 3
 *                description: The updated name of the product
 *                example: "Apple"
 *              description:
 *                type: string
 *                description: The updated description of the product
 *                example: "Fresh and juicy apples"
 *              productTypeId:
 *                type: string
 *                format: uuid
 *                description: The ID of the updated product type
 *                example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *              unitTypeId:
 *                type: string
 *                format: uuid
 *                description: The ID of the updated unit type
 *                example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *              minQuantity:
 *                type: number
 *                minimum: 1
 *                description: The updated minimum quantity of the product
 *                example: 10
 *    responses:
 *      200:
 *        description: Successfully updated the product details.
 *      400:
 *        description: Bad request. Possible reasons -> product not found, name already in use, invalid product type, invalid unit type.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Product not found."
 *      401:
 *        description: Unauthorized. The user is not authorized to perform this action.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not authorized."
 *      403:
 *        description: Forbidden. The user is not allowed to update the product.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Action not authorized."
 *      404:
 *        description: Not found. The product was not found.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Product not found."
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

updateProduct.put(
  "/api/v1/products/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      name: string().min(3).optional(),
      description: string().optional(),
      productTypeId: string().uuid().optional(),
      unitTypeId: string().uuid().optional(),
      minQuantity: number().min(1).positive().optional(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { name, description, minQuantity, productTypeId, unitTypeId } =
        await requestBodySchema.validate(request.body);

      const selectedProduct = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1",
        [publicId],
      );

      if (!selectedProduct || selectedProduct.length === 0)
        return response.status(404).send({ message: "Product not found." });

      const didAuthenticatedUserNotCreateTheProduct =
        selectedProduct[0].user_id !== userId;

      if (didAuthenticatedUserNotCreateTheProduct)
        return response.status(403).send({ message: "Action not authorized." });

      const isNameAlreadyInUse = await queryDatabase(
        "SELECT * FROM products WHERE name = $1 AND public_id <> $2 AND user_id = $3",
        [name, publicId, userId],
      );

      if (isNameAlreadyInUse && isNameAlreadyInUse.length > 0)
        return response
          .status(400)
          .send({ message: "Name is already in use." });

      if (productTypeId) {
        const doesProductTypeExists = await queryDatabase(
          "SELECT id FROM product_types WHERE public_id = $1",
          [productTypeId],
        );

        if (!doesProductTypeExists[0])
          return response.status(400).send({ message: "Invalid ProductType." });
      }

      if (unitTypeId) {
        const doesUnitTypeExists = await queryDatabase(
          "SELECT id FROM unit_types WHERE public_id = $1",
          [unitTypeId],
        );

        if (!doesUnitTypeExists[0])
          return response.status(400).send({ message: "Invalid UnitType." });
      }

      await queryDatabase(
        "UPDATE products SET name = $1, description = $2, product_type_id = $3, unit_type_id = $4, min_quantity = $5, updated_at = $6 WHERE public_id = $7",
        [
          name ?? selectedProduct[0].name,
          description ?? selectedProduct[0].description,
          productTypeId ?? selectedProduct[0].product_type_id,
          unitTypeId ?? selectedProduct[0].unit_type_id,
          minQuantity ?? selectedProduct[0].min_quantity,
          new Date(),
          publicId,
        ],
      );

      return response.status(200).send();
    } catch (error) {
      const { message, statusCode } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { updateProduct };
