import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { array, number, object, string } from "yup";
import { queryDatabase } from "../../utils/query.js";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const completeShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}/complete:
 *   patch:
 *     summary: Complete a shopping list
 *     description: Marks a shopping list as completed and updates the quantities and prices of products bought. Also updates the status of products in the user's storage.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         description: The public ID of the shopping list to complete.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productsBought:
 *                 type: array
 *                 description: An array of objects representing the products bought in this shopping list.
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       description: The public ID of the product bought.
 *                       example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *                     quantityBought:
 *                       type: number
 *                       description: The quantity of the product bought.
 *                       example: 2
 *                     pricePaidPerItem:
 *                       type: number
 *                       description: The price paid per item of the product.
 *                       example: 10.99
 *                     brandName:
 *                       type: string
 *                       description: The name of the brand of the product.
 *                       example: MyBrand
 *     responses:
 *       204:
 *         description: Shopping list successfully completed.
 *       400:
 *         description: Shopping list is already completed or provided data is invalid.
 *       401:
 *         description: User does not have a storage.
 *       404:
 *         description: Shopping list not found.
 *       default:
 *         description: Error processing the request.
 */

completeShoppingList.patch(
  "/api/v1/shopping-lists/:publicId/complete",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      productsBought: array()
        .min(1)
        .of(
          object({
            productId: string().uuid().required(),
            quantityBought: number().positive().required().min(1),
            pricePaidPerItem: number().positive().optional().min(0.05),
            brandName: string().optional(),
          }),
        ),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { productsBought } = await requestBodySchema.validate(request.body);

      const shoppingList = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!shoppingList[0])
        return response
          .status(404)
          .send({ message: "Shopping List not found." });

      if (shoppingList[0].completed_at)
        return response
          .status(400)
          .send({ message: "Shopping List is already completed." });

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE user_id = $1",
        [userId],
      );

      if (!storage[0])
        return response
          .status(401)
          .send({ message: "User does not have a storage." });

      await Promise.all(
        productsBought.map(async (product) => {
          const brandExists = await queryDatabase(
            "SELECT * FROM brands WHERE name LIKE $1",
            [`%${product.brandName}%`],
          );

          if (!brandExists[0]) {
            // Create brand
          }

          let totalPricePaid = 0;
          if (product.pricePaidPerItem) {
            const publicId = crypto.randomUUID();

            await queryDatabase(
              "INSERT INTO product_price_logs (public_id, brand_id, product_id, price) VALUES ($1, $2, $3, $4)",
              [
                publicId,
                brandExists[0]?.public_id ?? null,
                product.productId,
                product.pricePaidPerItem,
              ],
            );

            totalPricePaid = product.pricePaidPerItem * product.quantityBought;
          }

          await queryDatabase(
            `
        UPDATE shopping_list_products SET
        brand_id = $1,
        quantity_bought = $2,
        price_paid_per_item = $3,
        total_price_paid = $4,
        updated_at = $5
        WHERE shopping_list_id = $6 AND product_id = $7
      `,
            [
              brandExists[0]?.public_id ?? null,
              product.quantityBought,
              product.pricePaidPerItem,
              totalPricePaid,
              new Date(),
              shoppingList[0].public_id,
              product.productId,
            ],
          );

          await queryDatabase(
            "UPDATE shopping_lists SET completed_at = $1 WHERE public_id = $2",
            [new Date(), shoppingList[0].public_id],
          );

          let productQuantityInStorage = await queryDatabase(
            "SELECT quantity FROM storage_products WHERE storage_id = $1 AND product_id = $2",
            [storage[0].public_id, product.productId],
          );

          if (!productQuantityInStorage[0]) {
            const publicId = crypto.randomUUID();

            await queryDatabase(
              "INSERT INTO storage_products (public_id, storage_id, product_id, brand_id, quantity, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING quantity",
              [
                publicId,
                storage[0].public_id,
                product.productId,
                brandExists[0]?.public_id ?? null,
                product.quantityBought,
                "In Risk",
              ],
            );
          }

          await queryDatabase(
            "UPDATE storage_products SET quantity = $1, brand_id = $2 WHERE storage_id = $3 AND product_id = $4",
            [
              productQuantityInStorage[0].quantity + product.quantityBought,
              brandExists[0]?.public_id ?? null,
              storage[0].public_id,
              product.productId,
            ],
          );

          productQuantityInStorage = await queryDatabase(
            "SELECT quantity FROM storage_products WHERE storage_id = $1 AND product_id = $2",
            [storage[0].public_id, product.productId],
          );

          const productData = await queryDatabase(
            "SELECT * FROM products WHERE public_id = $1",
            [product.productId],
          );

          let productStatus;

          if (
            productQuantityInStorage[0].quantity === productData[0].min_quantity
          ) {
            productStatus = "Needs Attention";
          } else if (
            productQuantityInStorage[0].quantity >=
            productData[0].min_quantity + 1
          ) {
            productStatus = "Fine";
          } else {
            productStatus = "In Risk";
          }

          await queryDatabase(
            "UPDATE storage_products SET status = $1 WHERE storage_id = $2 AND product_id = $3",
            [productStatus, storage[0].public_id, product.productId],
          );
        }),
      );

      return response.status(204).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { completeShoppingList };
