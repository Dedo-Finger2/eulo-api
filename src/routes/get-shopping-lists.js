import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getShoppingLists = Router();

getShoppingLists.get(
  "/api/v1/shopping-lists",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const shoppingLists = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE user_id = $1",
        [userId],
      );

      if (!shoppingLists)
        return response
          .status(404)
          .send({ message: "No Shopping List found." });

      return response.status(200).send({ shoppingLists });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getShoppingLists };
