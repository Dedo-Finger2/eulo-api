import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { array, object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";

const addProductsInShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}:
 *   post:
 *     summary: Add products to a shopping list
 *     description: Allows users to add products to a specific shopping list.
 *     tags: [Shopping Lists]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The public ID of the shopping list.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     publicId:
 *                       type: string
 *                       format: uuid
 *                       description: The public ID of the product.
 *                       example: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *                     brandId:
 *                       type: string
 *                       format: uuid
 *                       description: The public ID of the brand (optional).
 *                       example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *     responses:
 *       200:
 *         description: Products successfully added to the shopping list.
 *       400:
 *         description: Bad request. None of the products selected were valid.
 *       404:
 *         description: Shopping list not found or user does not have a storage.
 *       default:
 *         description: Error processing the request.
 */

addProductsInShoppingList.post(
  "/api/v1/shopping-lists/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      products: array()
        .min(1)
        .of(
          object({
            publicId: string().uuid().required(),
            brandId: string().uuid().optional(),
          }),
        ),
    });
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { products } = await requestBodySchema.validate(request.body);
      const { userId } = await cookieSchema.validate(request.cookies);

      const shoppingList = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!shoppingList[0])
        return response
          .status(404)
          .send({ message: "Shopping List not found." });

      const validProductsArray = await Promise.all(
        products.map(async (product) => {
          const productExists = await queryDatabase(
            "SELECT min_quantity FROM products WHERE public_id = $1",
            [product.publicId],
          );
          const productAlreadyInShoppingList = await queryDatabase(
            "SELECT id FROM shopping_list_products WHERE shopping_list_id = $1 AND product_id = $2",
            [publicId, product.publicId],
          );

          let brandExists = undefined;

          if (product.brandId) {
            brandExists = await queryDatabase(
              "SELECT public_id FROM brands WHERE public_id = $1",
              [product.brandId],
            );
          }

          const storage = await queryDatabase(
            "SELECT * FROM storages WHERE user_id = $1",
            [userId],
          );

          if (!storage[0])
            return response
              .status(404)
              .send({ message: "User does not have a storage." });

          const productWithoutBrand =
            productExists[0] &&
            brandExists === undefined &&
            productAlreadyInShoppingList[0] === undefined;
          const productWithBrand =
            productExists[0] &&
            brandExists &&
            brandExists[0] &&
            productAlreadyInShoppingList[0] === undefined;

          if (productWithoutBrand || productWithBrand) {
            return {
              ...product,
            };
          }

          return undefined;
        }),
      );

      const filteredValidProductsArray = validProductsArray.filter(
        (product) => product !== undefined,
      );

      if (filteredValidProductsArray.length < 1)
        return response.status(400).send({
          message: "None of the products select were valid. Try again.",
          causes:
            "Product might not be valid or Product is already in the Shopping List.",
        });

      const values = [];

      const placeholders = filteredValidProductsArray
        .map((product, index) => {
          const shoppingListProductsPublicId = randomUUID();

          values.push(
            shoppingListProductsPublicId,
            publicId,
            product.publicId,
            product.brandId || null,
          );

          return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`;
        })
        .join(",");

      await queryDatabase(
        `INSERT INTO shopping_list_products (public_id, shopping_list_id, product_id, brand_id) VALUES ${placeholders}`,
        values,
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { addProductsInShoppingList };
