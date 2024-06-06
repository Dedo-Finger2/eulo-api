import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";

const createProductType = Router();

/**
 * @swagger
 * /api/v1/productTypes:
 *   post:
 *     summary: Create a new product type
 *     description: Creates a new product type with the provided name and description.
 *     tags: [Product Types]
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
 *                 description: The name of the product type.
 *                 minLength: 3
 *                 example: Electronics
 *               description:
 *                 type: string
 *                 description: The description of the product type.
 *                 example: This is a description of the electronics product type.
 *     responses:
 *       201:
 *         description: Product type successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The public ID of the created product type.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: Name already in use or invalid data provided.
 *       500:
 *         description: Error on creating a new product type. Try again later.
 *       default:
 *         description: Error processing the request.
 */

createProductType.post(
  "/api/v1/productTypes",
  verifyAuthCookie,
  async (request, response) => {
    const requestBodySchema = object({
      name: string().required().min(3),
      description: string().optional(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { name, description } = await requestBodySchema.validate(
        request.body,
      );
      const { userId } = await cookiesSchema.validate(request.cookies);

      const doesProductTypeAlreadyExists = await queryDatabase(
        "SELECT * FROM product_types WHERE name = $1",
        [name],
      );

      if (
        doesProductTypeAlreadyExists.length > 0 &&
        doesProductTypeAlreadyExists
      )
        return response.status(400).send({ message: "Name already in use." });

      const publicId = randomUUID();

      const createdProductType = await queryDatabase(
        "INSERT INTO product_types (public_id, name, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [publicId, name, description, userId],
      );

      if (!createdProductType)
        return response.status(500).send({
          message: "Error on creating a new productType. Try again later.",
        });

      return response
        .status(201)
        .send({ message: createdProductType.public_id });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createProductType };
