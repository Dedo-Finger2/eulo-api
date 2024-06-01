import { Router } from "express";
import { object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { handleFileUploadMiddleware } from "../config/file-upload.js";

const createBrand = Router();

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

      console.log(brandImage.originalname);

      const doesBrandAlreadyExists = await queryDatabase(
        "SELECT * FROM brands WHERE name = $1",
        [name],
      );

      if (doesBrandAlreadyExists.length > 0 && doesBrandAlreadyExists)
        return response.status(400).send({ message: "Name already in use." });

      // TODO: Tratar upload de imagem se houver imagem

      const publicId = randomUUID();

      const createdBrand = await queryDatabase(
        "INSERT INTO brands (public_id, name, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [publicId, name, description, userId],
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
