import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";

const createProductType = Router();

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
