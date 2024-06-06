import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getProduct = Router();

/**
 * @swagger
 * /api/v1/products/{publicId}:
 *   get:
 *     summary: Get a product by public ID
 *     description: Retrieves the details of a product owned by the authenticated user.
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
 *         description: The public ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: Product successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     min_quantity:
 *                       type: number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     productType:
 *                       type: object
 *                       properties:
 *                         public_id:
 *                           type: string
 *                           format: uuid
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                     unitType:
 *                       type: object
 *                       properties:
 *                         public_id:
 *                           type: string
 *                           format: uuid
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Not authorized.
 *       404:
 *         description: Product not found.
 *       default:
 *         description: Error processing the request.
 */

getProduct.get(
  "/api/v1/products/:publicId",
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

      const selectedProductProductType = await queryDatabase(
        "SELECT public_id, id, name, description, created_at, updated_at FROM product_types WHERE public_id = $1",
        [doesProductExists[0].product_type_id],
      );
      const selectedProductUnitType = await queryDatabase(
        "SELECT public_id, id, name, description, created_at, updated_at FROM unit_types WHERE public_id = $1",
        [doesProductExists[0].unit_type_id],
      );

      delete doesProductExists[0].product_type_id;
      delete doesProductExists[0].unit_type_id;
      delete doesProductExists[0].user_id;

      const finalProductStructure = {
        ...doesProductExists[0],
        productType: selectedProductProductType[0],
        unitType: selectedProductUnitType[0],
      };

      return response.status(200).send({ product: finalProductStructure });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getProduct };
