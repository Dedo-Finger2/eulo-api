import { Router } from "express";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";
import { handleImageRenaming } from "../utils/handle-image-file-rename.js";
import { handleFileUploadMiddleware } from "../config/file-upload.js";

const updateBrand = Router();

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