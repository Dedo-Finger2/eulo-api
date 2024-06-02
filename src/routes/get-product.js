import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getProduct = Router();

getProduct.get(
  "/api/v1/products/:publicId",
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

      const selectedProductProductType = await queryDatabase(
        "SELECT public_id, id, name, description, created_at, updated_at FROM product_types WHERE public_id = $1",
        [doesProductExists[0].product_type_id],
      );
      const selectedProductUnitType = await queryDatabase(
        "SELECT public_id, id, name, description, created_at, updated_at FROM unit_types WHERE public_id = $1",
        [doesProductExists[0].unit_type_id],
      );

      delete doesProductExists[0].product_type_id;
      delete doesProductExists[0].unit_type_id;
      delete doesProductExists[0].user_id;

      const finalProductStructure = {
        ...doesProductExists[0],
        productType: selectedProductProductType[0],
        unitType: selectedProductUnitType[0],
      };

      return response.status(200).send({ product: finalProductStructure });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getProduct };
