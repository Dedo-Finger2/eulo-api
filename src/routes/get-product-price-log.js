import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getProductPriceLog = Router();

getProductPriceLog.get(
  "/api/v1/products/:publicId/price-log",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { userId } = await cookiesSchema.validate(request.cookies);

      const doesProductExists = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!doesProductExists[0])
        return response.status(404).send({ message: "Product not found." });

      const productPriceLog = await queryDatabase(
        "SELECT * FROM product_price_logs WHERE product_id = $1",
        [publicId],
      );

      return response.status(200).send({ priceLog: productPriceLog });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getProductPriceLog };
