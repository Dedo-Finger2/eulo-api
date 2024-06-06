import { Router } from "express";
import { queryDatabase } from "../../utils/query.js";
import { verifyAuthCookie } from "./middlewares/verify-auth-cookie.js";
import { object, string } from "yup";
import { handleHttpResponseErrors } from "../../utils/handle-response-return.js";

const deleteBrand = Router();

/**
 * @swagger
 * /api/v1/brands/{publicId}:
 *   delete:
 *     summary: Delete a brand
 *     description: Deletes a brand owned by the authenticated user.
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The public ID of the brand to be deleted.
 *     responses:
 *       200:
 *         description: Brand successfully deleted.
 *       401:
 *         description: Not authorized to delete the brand.
 *       404:
 *         description: Brand not found.
 *       default:
 *         description: Error processing the request.
 */

deleteBrand.delete(
  "/api/v1/brands/:publicId",
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

      const selectedBrand = await queryDatabase(
        "SELECT * FROM brands WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      if (!selectedBrand[0])
        return response.status(404).send({ message: "Brand not found." });

      // TODO: Verify is brand is being used, if so then deny the delete command.
      // TODO: Delete the image of that brand in the storage as well.

      await queryDatabase(
        "DELETE FROM brands WHERE public_id = $1 AND user_id = $2",
        [publicId, userId],
      );

      return response.status(200).send();
    } catch (error) {
      const { statusCode, message } = handleHttpResponseErrors(error);

      return response.status(statusCode).send({ message });
    }
  },
);

export { deleteBrand };
