import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const deleteProductType = Router();

deleteProductType.delete(
  "/api/v1/productTypes/:publicId",
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

      const doesUserExists = await queryDatabase(
        "SELECT * FROM users WHERE public_id = $1",
        [userId],
      );

      if (!doesUserExists[0])
        return response.status(401).send({ message: "Not authorized." });

      const selectedProductType = await queryDatabase(
        "SELECT * FROM product_types WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!selectedProductType[0])
        return response.status(404).send({ message: "ProductType not found." });

      // TODO: Verify is ProductType is being used, if so then deny the delete command.

      await queryDatabase(
        "DELETE FROM product_types WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteProductType };
