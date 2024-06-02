import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const getProducts = Router();

getProducts.get(
  "/api/v1/products",
  verifyAuthCookie,
  async (request, response) => {
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);

      const products = await queryDatabase(
        "SELECT * FROM products WHERE user_id = $1",
        [userId],
      );

      if (!products)
        return response.status(404).send({ message: "No products found." });

      const finalProducts = await Promise.all(
        products.map(async (product) => {
          const selectedProductProductType = await queryDatabase(
            "SELECT public_id, id, name, description, created_at, updated_at FROM product_types WHERE public_id = $1",
            [product.product_type_id],
          );
          const selectedProductUnitType = await queryDatabase(
            "SELECT public_id, id, name, description, created_at, updated_at FROM unit_types WHERE public_id = $1",
            [product.unit_type_id],
          );

          delete product.product_type_id;
          delete product.unit_type_id;
          delete product.user_id;

          return {
            ...product,
            productType: selectedProductProductType[0],
            unitType: selectedProductUnitType[0],
          };
        }),
      );

      return response.status(200).send({ products: finalProducts });
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { getProducts };
