import { Router } from "express";
import { number, object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { queryDatabase } from "../utils/query.js";

const updateProduct = Router();

updateProduct.put(
  "/api/v1/products/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      name: string().min(3).optional(),
      description: string().optional(),
      productTypeId: string().uuid().optional(),
      unitTypeId: string().uuid().optional(),
      minQuantity: number().min(1).positive().optional(),
    });
    const cookiesSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { userId } = await cookiesSchema.validate(request.cookies);
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { name, description, minQuantity, productTypeId, unitTypeId } =
        await requestBodySchema.validate(request.body);

      const selectedProduct = await queryDatabase(
        "SELECT * FROM products WHERE public_id = $1",
        [publicId],
      );

      if (!selectedProduct || selectedProduct.length === 0)
        return response.status(404).send({ message: "Product not found." });

      const didAuthenticatedUserNotCreateTheProduct =
        selectedProduct[0].user_id !== userId;

      if (didAuthenticatedUserNotCreateTheProduct)
        return response.status(403).send({ message: "Action not authorized." });

      const isNameAlreadyInUse = await queryDatabase(
        "SELECT * FROM products WHERE name = $1 AND public_id <> $2 AND user_id = $3",
        [name, publicId, userId],
      );

      if (isNameAlreadyInUse && isNameAlreadyInUse.length > 0)
        return response
          .status(400)
          .send({ message: "Name is already in use." });

      if (productTypeId) {
        const doesProductTypeExists = await queryDatabase(
          "SELECT id FROM product_types WHERE public_id = $1",
          [productTypeId],
        );

        if (!doesProductTypeExists[0])
          return response.status(400).send({ message: "Invalid ProductType." });
      }

      if (unitTypeId) {
        const doesUnitTypeExists = await queryDatabase(
          "SELECT id FROM unit_types WHERE public_id = $1",
          [unitTypeId],
        );

        if (!doesUnitTypeExists[0])
          return response.status(400).send({ message: "Invalid UnitType." });
      }

      await queryDatabase(
        "UPDATE products SET name = $1, description = $2, product_type_id = $3, unit_type_id = $4, min_quantity = $5, updated_at = $6 WHERE public_id = $7",
        [
          name ?? selectedProduct[0].name,
          description ?? selectedProduct[0].description,
          productTypeId ?? selectedProduct[0].product_type_id,
          unitTypeId ?? selectedProduct[0].unit_type_id,
          minQuantity ?? selectedProduct[0].min_quantity,
          new Date(),
          publicId,
        ],
      );

      return response.status(200).send();
    } catch (error) {
      const { message, statusCode } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { updateProduct };
