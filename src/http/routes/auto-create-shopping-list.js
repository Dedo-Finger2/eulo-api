import { Router } from "express";
import { queryDatabase } from "../../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { randomUUID } from "node:crypto";

const autoCreateShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/auto-create:
 *   post:
 *     summary: Automatically create a shopping list
 *     description: Automatically creates a shopping list based on products in the user's storage that need attention or are at risk.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: The public ID of the user.
 *                 example: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *     responses:
 *       201:
 *         description: Shopping list successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:
 *                   type: string
 *                   format: uuid
 *                   description: The public ID of the newly created shopping list.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: No products are in need at the moment.
 *       404:
 *         description: Storage not found.
 *       default:
 *         description: Error processing the request.
 */

autoCreateShoppingList.post(
  "/api/v1/shopping-lists/auto-create",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE user_id = $1",
        [userId],
      );

      if (!storage[0])
        return response.status(404).send({ message: "Storage not found." });

      const lookUpStatus = ["In Risk", "Needs Attention"];

      const productsInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1 AND status = $2 OR status = $3",
        [storage[0].public_id, lookUpStatus[0], lookUpStatus[1]],
      );

      console.log(productsInStorage);

      if (productsInStorage.length === 0)
        return response
          .status(400)
          .send({ message: "No products are in need at the moment." });

      const shoppingListPublicId = randomUUID();

      const shoppingList = await queryDatabase(
        "INSERT INTO shopping_lists (public_id, user_id) VALUES ($1, $2) RETURNING *",
        [shoppingListPublicId, userId],
      );

      await Promise.all(
        productsInStorage.map(async (product) => {
          const productPublicId = randomUUID();

          await queryDatabase(
            "INSERT INTO shopping_list_products (public_id, shopping_list_id, product_id, brand_id) VALUES ($1, $2, $3, $4)",
            [
              productPublicId,
              shoppingList.public_id,
              product.product_id,
              product.brand_id,
            ],
          );
        }),
      );

      return response.status(201).send({ publicId: shoppingListPublicId });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { autoCreateShoppingList };
