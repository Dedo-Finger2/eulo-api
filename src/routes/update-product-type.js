import { Router } from "express";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";

const updateProductType = Router();

updateProductType.put(
  "/api/v1/productTypes/:publicId",
  verifyAuthCookie,
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

      const isUserValid = await queryDatabase(
        "SELECT * FROM users WHERE public_id = $1",
        [userId],
      );

      if (!isUserValid || !isUserValid.length === 0)
        return response.status(401).send({ message: "Not authorized." });

      const selectedProductType = await queryDatabase(
        "SELECT * FROM product_types WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!selectedProductType || selectedProductType.length === 0)
        return response.status(404).send({ message: "ProductType not found." });

      const didAuthenticatedUserNotCreateTheProductType =
        selectedProductType[0].user_id !== userId;

      if (didAuthenticatedUserNotCreateTheProductType)
        return response.status(403).send({ message: "Action not authorized." });

      const isNameAlreadyInUse = await queryDatabase(
        "SELECT * FROM product_types WHERE name = $1 AND public_id <> $2 AND user_id = $3",
        [name, publicId, userId],
      );

      if (isNameAlreadyInUse && isNameAlreadyInUse.length > 0)
        return response
          .status(400)
          .send({ message: "Name is already in use." });

      await queryDatabase(
        "UPDATE product_types SET name = $1, description = $2, updated_at = $3 WHERE public_id = $4",
        [
          name ?? selectedProductType[0].name,
          description ?? selectedProductType[0].description,
          new Date(),
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

export { updateProductType };
