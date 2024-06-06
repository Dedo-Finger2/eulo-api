import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getProductPriceLog = Router();

/**
 * @swagger
 * /api/v1/products/{publicId}/price-log:
 *   get:
 *     summary: Get price log of a product
 *     description: Retrieves the price log of a product owned by the authenticated user.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The public ID of the product to retrieve the price log.
 *     responses:
 *       200:
 *         description: Price log successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 priceLog:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       public_id:
 *                         type: string
 *                         format: uuid
 *                       brand_id:
 *                         type: string
 *                         format: uuid
 *                       product_id:
 *                         type: string
 *                         format: uuid
 *                       price:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Product not found.
 *       default:
 *         description: Error processing the request.
 */

getProductPriceLog.get(
  "/api/v1/products/:publicId/price-log",
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

      const doesProductExists = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!doesProductExists[0])
        return response.status(404).send({ message: "Product not found." });

      const productPriceLog = await queryDatabase(
        "SELECT * FROM product_price_logs WHERE product_id = $1",
        [publicId],
      );

      return response.status(200).send({ priceLog: productPriceLog });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getProductPriceLog };
