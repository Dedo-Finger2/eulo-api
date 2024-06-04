import { Router } from "express";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { array, number, object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";

const addProductsInStorage = Router();

addProductsInStorage.post(
  "/api/v1/storages/:publicId",
  verifyAuthCookie,
  async (request, response) => {
    const requestParamsSchema = object({
      publicId: string().uuid().required(),
    });
    const requestBodySchema = object({
      products: array()
        .min(1)
        .of(
          object({
            publicId: string().uuid().required(),
            quantity: number().positive().min(1).required(),
            brandId: string().uuid().optional(),
          }),
        ),
    });
    const cookieSchema = object({
      userId: string().uuid().required(),
    });

    try {
      const { publicId } = await requestParamsSchema.validate(request.params);
      const { products } = await requestBodySchema.validate(request.body);
      const { userId } = await cookieSchema.validate(request.cookies);

      const storage = await queryDatabase(
        "SELECT * FROM storages WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!storage[0])
        return response.status(404).send({ message: "Storage not found." });

      const validProductsArray = await Promise.all(
        products.map(async (product) => {
          const productExists = await queryDatabase(
            "SELECT min_quantity FROM products WHERE public_id = $1",
            [product.publicId],
          );
          const productAlreadyInStorage = product.brandId
            ? await queryDatabase(
                "SELECT id FROM storage_products WHERE storage_id = $1 AND product_id = $2 AND brand_id = $3",
                [publicId, product.publicId, product.brandId],
              )
            : await queryDatabase(
                "SELECT id FROM storage_products WHERE storage_id = $1 AND product_id = $2",
                [publicId, product.publicId],
              );

          let brandExists = undefined;

          if (product.brandId) {
            brandExists = await queryDatabase(
              "SELECT public_id FROM brands WHERE public_id = $1",
              [product.brandId],
            );
          }

          const productWithoutBrand =
            productExists[0] &&
            brandExists === undefined &&
            productAlreadyInStorage[0] === undefined;
          const productWithBrand =
            productExists[0] &&
            brandExists &&
            brandExists[0] &&
            productAlreadyInStorage[0] === undefined;

          if (productWithoutBrand || productWithBrand) {
            let productStatus;

            if (product.quantity >= productExists[0].min_quantity) {
              productStatus = "Fine";
            } else if (product.quantity === productExists[0].min_quantity) {
              productStatus = "Needs Attention";
            } else {
              productStatus = "In Risk";
            }

            return {
              ...product,
              status: productStatus,
              disconsider: false,
            };
          }

          return undefined;
        }),
      );

      const filteredValidProductsArray = validProductsArray.filter(
        (product) => product !== undefined,
      );

      if (filteredValidProductsArray.length < 1)
        return response.status(400).send({
          message: "None of the products select were valid. Try again.",
          causes:
            "Product might not be valid or Product is already in the storage.",
        });

      const values = [];

      const placeholders = filteredValidProductsArray
        .map((product, index) => {
          const storageProductsPublicId = randomUUID();

          values.push(
            storageProductsPublicId,
            publicId,
            product.publicId,
            product.brandId || null,
            product.quantity,
            product.status,
            product.disconsider,
          );

          return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}, $${index + 7})`;
        })
        .join(",");

      await queryDatabase(
        `INSERT INTO storage_products (public_id, storage_id, product_id, brand_id, quantity, status, disconsider) VALUES ${placeholders}`,
        values,
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { addProductsInStorage };
