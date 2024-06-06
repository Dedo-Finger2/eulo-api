import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { queryDatabase } from "../../utils/query.js";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const printShoppingList = Router();

/**
 * @swagger
 * /api/v1/shopping-lists/{publicId}/print:
 *   get:
 *     summary: Print shopping list details
 *     description: Retrieves detailed information about a shopping list for printing purposes.
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
 *         description: The public ID of the shopping list.
 *     responses:
 *       200:
 *         description: Shopping list details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shoppingListId:
 *                   type: string
 *                   format: uuid
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       public_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       productType:
 *                         type: string
 *                       unitType:
 *                         type: string
 *                       status:
 *                         type: string
 *                       quantityInStorage:
 *                         type: number
 *                       brandName:
 *                         type: string
 *       401:
 *         description: User does not have a storage.
 *       404:
 *         description: Shopping list not found.
 *       default:
 *         description: Error processing the request.
 */

printShoppingList.get(
  "/api/v1/shopping-lists/:publicId/print",
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
        "SELECT public_id FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
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
            "SELECT public_id, name, product_type_id, unit_type_id FROM products WHERE public_id = $1",
            [product.product_id],
          );

          const productType = await queryDatabase(
            "SELECT name FROM product_types WHERE public_id = $1",
            [productData[0].product_type_id],
          );
          const unitType = await queryDatabase(
            "SELECT name FROM unit_types WHERE public_id = $1",
            [productData[0].unit_type_id],
          );

          const productDataInStorage = await queryDatabase(
            "SELECT quantity, status FROM storage_products WHERE storage_id = $1 AND product_id = $2",
            [storage[0].public_id, product.product_id],
          );

          const productBrandId = await queryDatabase(
            "SELECT brand_id FROM shopping_list_products WHERE shopping_list_id = $1 AND product_id = $2",
            [shoppingList[0].public_id, product.product_id],
          );

          const brand = await queryDatabase(
            "SELECT name FROM brands WHERE public_id = $1",
            [productBrandId[0].brand_id],
          );

          delete productData[0].product_type_id;
          delete productData[0].unit_type_id;

          return {
            ...productData[0],
            productType: productType[0].name,
            unitType: unitType[0].name,
            status: productDataInStorage[0]?.status ?? undefined,
            quantityInStorage: productDataInStorage[0]?.quantity ?? undefined,
            brandName: brand[0]?.name ?? undefined,
          };
        }),
      );

      const printableShoppingList = {
        shoppingListId: shoppingList[0].public_id,
        products: [...products],
      };

      return response.status(200).send(printableShoppingList);
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { printShoppingList };
