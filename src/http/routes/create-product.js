import { Router } from "express";
import { number, object, string } from "yup";
import { queryDatabase } from "../../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";

const createProduct = Router();

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product with the provided name, description, product type ID, unit type ID, and minimum quantity.
 *     tags: [Products]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product.
 *                 minLength: 3
 *                 example: Laptop
 *               description:
 *                 type: string
 *                 description: The description of the product.
 *                 example: This is a description of the laptop product.
 *               productTypeId:
 *                 type: string
 *                 description: The public ID of the product type associated with the product.
 *                 format: uuid
 *                 example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *               unitTypeId:
 *                 type: string
 *                 description: The public ID of the unit type associated with the product.
 *                 format: uuid
 *                 example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *               minQuantity:
 *                 type: number
 *                 description: The minimum quantity of the product.
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       201:
 *         description: Product successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:
 *                   type: string
 *                   description: The public ID of the created product.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: Name already in use or invalid data provided.
 *       500:
 *         description: Error on creating a new product. Try again later.
 *       default:
 *         description: Error processing the request.
 */

createProduct.post(
  "/api/v1/products",
  verifyAuthCookie,
  async (request, response) => {
    const requestBodySchema = object({
      name: string().required().min(3),
      description: string().optional(),
      productTypeId: string().uuid().required(),
      unitTypeId: string().uuid().required(),
      minQuantity: number().positive().min(1).required(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { name, description, minQuantity, productTypeId, unitTypeId } =
        await requestBodySchema.validate(request.body);
      const { userId } = await cookiesSchema.validate(request.cookies);

      const isNameAlreadyInUse = await queryDatabase(
        "SELECT id FROM products WHERE name = $1 AND user_id = $2",
        [name, userId],
      );

      if (isNameAlreadyInUse && isNameAlreadyInUse.length > 0)
        return response.status(400).send({ message: "Name already in use." });

      const isProductTypeValid = await queryDatabase(
        "SELECT id FROM product_types WHERE public_id = $1 AND user_id = $2",
        [productTypeId, userId],
      );

      if (!isProductTypeValid[0])
        return response
          .status(400)
          .send({ message: "Invalid ProductType provided." });

      const isUnitTypeValid = await queryDatabase(
        "SELECT id FROM unit_types WHERE public_id = $1 AND user_id = $2",
        [unitTypeId, userId],
      );

      if (!isUnitTypeValid[0])
        return response
          .status(400)
          .send({ message: "Invalid UnitType provided." });

      const publicId = randomUUID();

      const createdProduct = await queryDatabase(
        "INSERT INTO products (public_id, user_id, name, description, min_quantity, product_type_id, unit_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          publicId,
          userId,
          name,
          description,
          minQuantity,
          productTypeId,
          unitTypeId,
        ],
      );

      console.log(createdProduct);

      if (!createProduct)
        return response.status(500).send({
          message: "Error trying to create the product. Try again later.",
        });

      return response.status(201).send({ publicId: createdProduct.public_id });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createProduct };
