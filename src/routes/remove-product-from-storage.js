import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const removeProductFromStorage = Router();

removeProductFromStorage.patch(
  "/api/v1/storages/:publicId/products/:productPublicId/remove-product",
  verifyAuthCookie,
  async (request, response) => {
    const cookieSchema = object({
      userId: string().uuid().required(),
    });
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
      productPublicId: string().uuid().required(),
    });

    try {
      const { userId } = await cookieSchema.validate(request.cookies);
      const { publicId, productPublicId } = await requestParamsSchema.validate(
        request.params,
      );

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!storage[0])
        return response.status(404).send({ message: "Storage not found." });

      const product = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [productPublicId, userId],
      );

      if (!product[0])
        return response.status(404).send({ message: "Product not found." });

      const isProductInStorage = await queryDatabase(
        "SELECT * FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      if (!isProductInStorage[0])
        return response
          .status(400)
          .send({ message: "Product is not in storage." });

      await queryDatabase(
        "DELETE FROM storage_products WHERE storage_id = $1 AND product_id = $2",
        [publicId, productPublicId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { removeProductFromStorage };
