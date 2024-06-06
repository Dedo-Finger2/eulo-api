import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { handleFileUploadMiddleware } from "../config/file-upload.js";
import { handleImageRenaming } from "../utils/handle-image-file-rename.js";

const createBrand = Router();

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     description: Creates a new brand with the provided name, description, and optional image.
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the brand.
 *                 minLength: 3
 *                 example: MyBrand
 *               description:
 *                 type: string
 *                 description: The description of the brand.
 *                 example: This is a description of my brand.
 *               brandImage:
 *                 type: string
 *                 format: binary
 *                 description: The image file of the brand.
 *     responses:
 *       201:
 *         description: Brand successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The public ID of the created brand.
 *                   example: d5b25c62-df2b-446e-ae4a-46e0907a0b64
 *       400:
 *         description: Name already in use or invalid data provided.
 *       500:
 *         description: Error on creating a new brand. Try again later.
 *       default:
 *         description: Error processing the request.
 */

createBrand.post(
  "/api/v1/brands",
  verifyAuthCookie,
  handleFileUploadMiddleware.single("brandImage"),
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
      const brandImage = request.file;
      const { userId } = await cookiesSchema.validate(request.cookies);

      const { image, imageOriginalName } = handleImageRenaming({
        path: brandImage.path,
        originalname: brandImage.originalname,
      });

      const doesBrandAlreadyExists = await queryDatabase(
        "SELECT * FROM brands WHERE name = $1",
        [name],
      );

      if (doesBrandAlreadyExists.length > 0 && doesBrandAlreadyExists)
        return response.status(400).send({ message: "Name already in use." });

      const publicId = randomUUID();

      const createdBrand = await queryDatabase(
        "INSERT INTO brands (public_id, name, description, user_id, image, image_original_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [publicId, name, description, userId, image, imageOriginalName],
      );

      if (!createdBrand)
        return response
          .status(500)
          .send({ message: "Error on creating a new brand. Try again later." });

      return response.status(201).send({ message: createdBrand.public_id });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createBrand };
