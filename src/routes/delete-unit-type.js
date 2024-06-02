import { Router } from "express";
import { queryDatabase } from "../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../utils/handle-response-return.js";

const deleteUnitType = Router();

deleteUnitType.delete(
  "/api/v1/unitTypes/:publicId",
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

      const selectedUnitType = await queryDatabase(
        "SELECT * FROM unit_types WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!selectedUnitType[0])
        return response.status(404).send({ message: "UnitType not found." });

      // TODO: Verify is UnitType is being used, if so then deny the delete command.

      await queryDatabase(
        "DELETE FROM unit_types WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteUnitType };
