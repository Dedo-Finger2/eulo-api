import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { queryDatabase } from "../../utils/query.js";

const getShoppingListDetails = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}:
 *   get:
 *     summary: Get details of a specific shopping list
 *     description: Retrieves detailed information about a specific shopping list for the authenticated user.
 *     tags: [Shopping Lists]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The public ID of the shopping list
 *     responses:
 *       200:
 *         description: Shopping list details successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoppingList:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           public_id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           min_quantity:
 *                             type: number
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             description: The status of the product in storage
 *                           quantityInStorage:
 *                             type: number
 *                             description: The quantity of the product in storage
 *       401:
 *         description: User does not have a storage.
 *       404:
 *         description: Shopping List not found.
 *       default:
 *         description: Error processing the request.
 */

getShoppingListDetails.get(
  "/api/v1/shopping-lists/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);

      const shoppingList = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!shoppingList[0])
        return response
          .status(404)
          .send({ message: "Shopping List not found." });

      const storage = await queryDatabase(
        "SELECT public_id FROM storages WHERE user_id = $1",
        [userId],
      );

      if (!storage[0])
        return response
          .status(401)
          .send({ message: "User does not have a storage." });

      const shoppingListProductsPublicIds = await queryDatabase(
        "SELECT product_id FROM shopping_list_products WHERE shopping_list_id = $1",
        [publicId],
      );

      const products = await Promise.all(
        shoppingListProductsPublicIds.map(async (product) => {
          const productData = await queryDatabase(
            "SELECT * FROM products WHERE public_id = $1",
            [product.product_id],
          );

          const productDataInStorage = await queryDatabase(
            "SELECT quantity, status FROM storage_products WHERE storage_id = $1 AND product_id = $2",
            [storage[0].public_id, product.product_id],
          );

          return {
            ...productData[0],
            status: productDataInStorage[0]?.status ?? undefined,
            quantityInStorage: productDataInStorage[0]?.quantity ?? undefined,
          };
        }),
      );

      const finalShoppingList = {
        ...shoppingList[0],
        products: [...products],
      };

      return response.status(200).send({ shoppingList: finalShoppingList });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getShoppingListDetails };
