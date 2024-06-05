import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { queryDatabase } from "../utils/query.js";

const getShoppingListDetails = Router();

getShoppingListDetails.get(
  "/api/v1/shopping-lists/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);

      const shoppingList = await queryDatabase(
        "SELECT * FROM shopping_lists WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!shoppingList[0])
        return response
          .status(404)
          .send({ message: "Shopping List not found." });

      // TODO: Implement the products inside the shopping list
      // const shoppingListsProductsIds = await queryDatabase(`
      //   SELECT product_id FROM shopping_lists WHERE shopping_list_id = $1
      // `, [publicId]);

      // console.log(shoppingListsProductsIds);

      return response.status(200).send({ shoppingList: shoppingList[0] });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getShoppingListDetails };
