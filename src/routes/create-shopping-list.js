import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { randomUUID } from "node:crypto";

const createShoppingList = Router();

createShoppingList.post(
  "/api/v1/shopping-lists",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const publicId = randomUUID();

      await queryDatabase(
        "INSERT INTO shopping_lists (public_id, user_id) VALUES ($1, $2)",
        [publicId, userId],
      );

      return response.status(201).send({ publicId });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { createShoppingList };
