import { Router } from "express";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";
import { handleImageRenaming } from "../utils/handle-image-file-rename.js";
import { handleFileUploadMiddleware } from "../config/file-upload.js";

const updateBrand = Router();

/**
 * @swagger
 * /api/v1/brands/{publicId}:
 *  put:
 *    summary: Update a brand's details
 *    description: Update the details of a brand including name, description, and image.
 *    tags: [Brands]
 *    parameters:
 *      - in: path
 *        name: publicId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The public ID of the brand to update
 *        example: d9b1d7fa-1c46-4ae8-a9ed-89d1d7fae8b9
 *      - in: cookie
 *        name: userId
 *        schema:
 *          type: string
 *          format: uuid
 *        required: true
 *        description: The user's ID from the cookie
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                minLength: 3
 *                description: The new name of the brand
 *                example: "Brand Name"
 *              description:
 *                type: string
 *                description: The new description of the brand
 *                example: "Brand Description"
 *              brandImage:
 *                type: string
 *                format: binary
 *                description: The new image for the brand
 *    responses:
 *      200:
 *        description: Successfully updated the brand.
 *      400:
 *        description: Bad request. Possible reasons -> name already in use.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Name is already in use."
 *      401:
 *        description: Not authorized. The user is not authorized.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Not authorized."
 *      403:
 *        description: Forbidden. The action is not authorized for the user.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Action not authorized."
 *      404:
 *        description: Not found. The brand was not found.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Brand not found."
 *      500:
 *        description: Internal server error.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Internal server error."
 */

updateBrand.put(
  "/api/v1/brands/:publicId",
  [verifyAuthCookie, handleFileUploadMiddleware.single("brandImage")],
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      name: string().min(3).optional(),
      description: string().optional(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { name, description } = await requestBodySchema.validate(
        request.body,
      );
      const brandImage = request.file;

      const isUserValid = await queryDatabase(
        "SELECT * FROM users WHERE public_id = $1",
        [userId],
      );

      if (!isUserValid || !isUserValid.length === 0)
        return response.status(401).send({ message: "Not authorized." });

      const { image, imageOriginalName } = handleImageRenaming({
        path: brandImage?.path,
        originalname: brandImage?.originalname,
      });

      const selectedBrand = await queryDatabase(
        "SELECT * FROM brands WHERE public_id = $1",
        [publicId],
      );

      if (!selectedBrand || selectedBrand.length === 0)
        return response.status(404).send({ message: "Brand not found." });

      const didAuthenticatedUserNotCreateTheBrand =
        selectedBrand[0].user_id !== userId;

      if (didAuthenticatedUserNotCreateTheBrand)
        return response.status(403).send({ message: "Action not authorized." });

      const isNameAlreadyInUse = await queryDatabase(
        "SELECT * FROM brands WHERE name = $1 AND public_id <> $2 AND user_id = $3",
        [name, publicId, userId],
      );

      if (isNameAlreadyInUse && isNameAlreadyInUse.length > 0)
        return response
          .status(400)
          .send({ message: "Name is already in use." });

      await queryDatabase(
        "UPDATE brands SET name = $1, description = $2, image = $3, image_original_name = $4 WHERE public_id = $5",
        [
          name ?? selectedBrand[0].name,
          description ?? selectedBrand[0].description,
          image ?? selectedBrand[0].image,
          imageOriginalName ?? selectedBrand[0].image_original_name,
          publicId,
        ],
      );

      return response.status(200).send();
    } catch (error) {
      const { message, statusCode } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { updateBrand };
