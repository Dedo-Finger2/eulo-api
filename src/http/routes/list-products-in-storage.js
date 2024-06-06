import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { queryDatabase } from "../../utils/query.js";

const listProductsInStorage = Router();

/**
 * @swagger
 * /api/v1/storages/{publicId}:
 *   get:
 *     summary: List all products in the user's storage
 *     description: Retrieves all products stored in the user's storage.
 *     tags: [Storages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The public ID of the storage.
 *     responses:
 *       200:
 *         description: Products successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       storage_id:
 *                         type: string
 *                         format: uuid
 *                       product_id:
 *                         type: string
 *                         format: uuid
 *                       quantity:
 *                         type: number
 *                       status:
 *                         type: string
 *       400:
 *         description: User does not have a storage.
 *       default:
 *         description: Error processing the request.
 */

listProductsInStorage.get(
  "/api/v1/storages/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookieSchema.validate(request.cookies);

      const doesUserHasAStorage = await queryDatabase(
        "SELECT public_id FROM storages WHERE user_id = $1",
        [userId],
      );

      if (!doesUserHasAStorage[0])
        return response
          .status(400)
          .send({ message: "You don't have a storage." });

      const productsInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1",
        [doesUserHasAStorage[0].public_id],
      );

      return response.status(200).send({ products: productsInStorage });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { listProductsInStorage };
