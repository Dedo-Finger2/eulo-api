import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { queryDatabase } from "../utils/query.js";

const listProductsInStorage = Router();

listProductsInStorage.get(
  "/api/v1/storages/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookieSchema.validate(request.cookies);

      const doesUserHasAStorage = await queryDatabase(
        "SELECT public_id FROM storages WHERE user_id = $1",
        [userId],
      );

      if (!doesUserHasAStorage[0])
        return response
          .status(400)
          .send({ message: "You don't have a storage." });

      const productsInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1",
        [doesUserHasAStorage[0].public_id],
      );

      return response.status(200).send({ products: productsInStorage });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { listProductsInStorage };
